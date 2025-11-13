export default function GetImage({
    path,
    title = "Movie image",
    size = "w500",
    style = {},
    onClick
}) {
    const baseUrl = "https://image.tmdb.org/t/p";
    const url = `${baseUrl}/${size}${path}`;
    // console.log("image request:" , url) // debug url

    return <img src={url} alt={title} onClick={onClick} />;
}
