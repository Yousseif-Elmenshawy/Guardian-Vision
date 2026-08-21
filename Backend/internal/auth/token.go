package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
)

type TokenPayload struct {
	StudentID int64  `json:"student_id"`
	ExpiresAt int64  `json:"expires_at"`
	Issuer    string `json:"issuer"`
}

func GenerateToken(secret string, studentID int64, ttl time.Duration) (string, error) {
	payload := TokenPayload{
		StudentID: studentID,
		ExpiresAt: time.Now().Add(ttl).Unix(),
		Issuer:    "guardian-vision",
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	encodedPayload := base64.RawURLEncoding.EncodeToString(body)
	signature := sign(encodedPayload, secret)
	return encodedPayload + "." + signature, nil
}

func ParseToken(secret, token string) (TokenPayload, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 2 {
		return TokenPayload{}, errors.New("invalid token")
	}

	expected := sign(parts[0], secret)
	if !hmac.Equal([]byte(expected), []byte(parts[1])) {
		return TokenPayload{}, errors.New("invalid token signature")
	}

	body, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return TokenPayload{}, err
	}

	var payload TokenPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		return TokenPayload{}, err
	}
	if payload.ExpiresAt < time.Now().Unix() {
		return TokenPayload{}, errors.New("token expired")
	}

	return payload, nil
}

func sign(payload, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payload))
	mac.Write([]byte(strconv.FormatInt(int64(len(payload)), 10)))
	return fmt.Sprintf("%x", mac.Sum(nil))
}
