function saveCoordinates() {
    fetch("http://localhost:3000/save-coordinates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coordinates: perimeter }),
    })
        .then((response) => response.json())
        .then((data) => {
            alert(data.message);
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Failed to save coordinates.");
        });
}