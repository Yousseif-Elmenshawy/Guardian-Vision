package handlers

import "testing"

func TestIsNationalID(t *testing.T) {
	if !isNationalID("12345678901234") {
		t.Fatal("valid national ID was rejected")
	}
	for _, invalid := range []string{"1234567890123a", "١٢٣٤٥٦٧٨٩٠١٢٣٤"} {
		if isNationalID(invalid) {
			t.Errorf("invalid national ID %q was accepted", invalid)
		}
	}
}
