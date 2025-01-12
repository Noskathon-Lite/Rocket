import re
from Levenshtein import distance

def preprocess_plate(plate):
    """Normalize plate by removing special characters (except spaces) and converting to uppercase."""
    return re.sub(r'[^A-Za-z0-9 ]', '', plate.upper().strip())


def find_similar_plates(detected_plate, all_plates, threshold=6):
    detected_plate = preprocess_plate(detected_plate)
    similar_plates = []
    for plate in all_plates:
        normalized_plate = preprocess_plate(plate)
        dist = distance(detected_plate, normalized_plate)
        if dist <= threshold:
            similar_plates.append({"plate": plate, "distance": dist})
    return sorted(similar_plates, key=lambda x: x["distance"])
