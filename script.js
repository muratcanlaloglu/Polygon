function saveCoordinates() {
    // First fetch existing coordinates
    fetch("http://localhost:3000/get-coordinates")
        .then(response => response.json())
        .then(existingData => {
            // Combine existing coordinates with new ones
            const updatedCoordinates = Array.isArray(existingData) ? 
                [...existingData, ...perimeter] : 
                perimeter;

            // Save the combined coordinates
            return fetch("http://localhost:3000/save-coordinates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ coordinates: updatedCoordinates }),
            });
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Failed to save coordinates.");
        });
}