export default function GetImage({
    path,         // Image path from the API (required)
    title = "Movie image", // Alt text for accessibility
    size = "w500",         // Image size (default is "w500")
    style = {},            // Optional inline styles
    onClick                // Optional click handler
}) {
    const baseUrl = "https://image.tmdb.org/t/p";
    const url = `${baseUrl}/${size}${path}`;
    // console.log("image request:" , url) // Uncomment for debugging

    // Render the image
    return <img src={url} alt={title} onClick={onClick} style={style} />;
}
