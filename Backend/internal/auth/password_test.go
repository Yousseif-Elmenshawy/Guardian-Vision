package auth

import "testing"

func TestCheckPythonPBKDF2Hash(t *testing.T) {
	const storedHash = "pbkdf2_sha256$210000$AAECAwQFBgcICQoLDA0ODw$DS1CEwOXICG7ZK4yIBXdrvS6RUTwTGAIjZTCnc3yK3I"

	if !CheckPassword("student-password", "", storedHash) {
		t.Fatal("Python-generated PBKDF2 hash was rejected")
	}
	if CheckPassword("wrong-password", "", storedHash) {
		t.Fatal("wrong password was accepted")
	}
}
