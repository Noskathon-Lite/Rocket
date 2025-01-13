import re
from Levenshtein import distance

def preprocess_plate(plate):
    """
    Clean and rearrange detected texts into the license plate format: "B/A AA 4-digit".
    Removes garbage words and returns the cleaned plate text.
    """
    # Predefined garbage words to remove
    GARBAGE_WORDS = [
        "NEP", "BAGMATI", "GANDAKI",
        "STATE 1", "STATE 2", "STATE 3",
        "STATE 4", "STATE 5", "STATE 6", "STATE 7"
    ]

    # Combine detected texts into a single uppercase string
    combined_text = plate.upper()

    # Remove garbage words
    for garbage in GARBAGE_WORDS:
        combined_text = combined_text.replace(garbage, '')

    # Remove special characters except alphanumerics and spaces
    combined_text = re.sub(r'[^A-Z0-9 ]', '', combined_text)

    # Debugging: print combined cleaned text
    print(f"Combined Text after garbage removal: {combined_text}")

    # Extract valid components using regex
    first_letter_match = re.search(r'\b[BA]\b', combined_text)  # First letter: B or A
    two_letter_code_match = re.search(r'\bA[A-Z]\b', combined_text)  # Two letters starting with A
    number_match = re.search(r'\b\d{4}\b', combined_text)  # Four-digit number

    # Debugging: print regex matches
    print(f"First letter match: {first_letter_match}")
    print(f"Two-letter code match: {two_letter_code_match}")
    print(f"Four-digit number match: {number_match}")

    # Rearrange into the desired format if all components are valid
    if first_letter_match and two_letter_code_match and number_match:
        first_letter = first_letter_match.group(0)
        two_letter_code = two_letter_code_match.group(0)
        number = number_match.group(0)
        return f"{first_letter} {two_letter_code} {number}"
    else:
        # Return the cleaned combined text if format validation fails
        return combined_text



def find_similar_plates(detected_plate, all_plates, threshold=6):
    detected_plate = preprocess_plate(detected_plate)
    similar_plates = []
    for plate in all_plates:
        normalized_plate = preprocess_plate(plate)
        dist = distance(detected_plate, normalized_plate)
        if dist <= threshold:
            similar_plates.append({"plate": plate, "distance": dist})
    return sorted(similar_plates, key=lambda x: x["distance"])
