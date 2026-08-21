package auth

import (
	"crypto/pbkdf2"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"strconv"
	"strings"
)

const (
	passwordAlgorithm = "pbkdf2_sha256"
	passwordIter      = 210000
	passwordKeyLength = 32
	passwordSaltBytes = 16
)

func HashPassword(password, pepper string) (string, error) {
	salt := make([]byte, passwordSaltBytes)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}

	key, err := derivePasswordKey(password, pepper, salt, passwordIter)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf(
		"%s$%d$%s$%s",
		passwordAlgorithm,
		passwordIter,
		base64.RawStdEncoding.EncodeToString(salt),
		base64.RawStdEncoding.EncodeToString(key),
	), nil
}

func CheckPassword(password, pepper, storedHash string) bool {
	if strings.HasPrefix(storedHash, passwordAlgorithm+"$") {
		return checkPBKDF2Password(password, pepper, storedHash)
	}

	return strings.EqualFold(legacySHA256(password, pepper), storedHash)
}

func checkPBKDF2Password(password, pepper, storedHash string) bool {
	parts := strings.Split(storedHash, "$")
	if len(parts) != 4 || parts[0] != passwordAlgorithm {
		return false
	}

	iterations, err := strconv.Atoi(parts[1])
	if err != nil || iterations <= 0 {
		return false
	}

	salt, err := base64.RawStdEncoding.DecodeString(parts[2])
	if err != nil {
		return false
	}

	expectedKey, err := base64.RawStdEncoding.DecodeString(parts[3])
	if err != nil {
		return false
	}

	actualKey, err := derivePasswordKey(password, pepper, salt, iterations)
	if err != nil {
		return false
	}

	return subtle.ConstantTimeCompare(actualKey, expectedKey) == 1
}

func derivePasswordKey(password, pepper string, salt []byte, iterations int) ([]byte, error) {
	return pbkdf2.Key(sha256.New, password+pepper, salt, iterations, passwordKeyLength)
}

func legacySHA256(password, pepper string) string {
	sum := sha256.Sum256([]byte(password + pepper))
	return hex.EncodeToString(sum[:])
}
