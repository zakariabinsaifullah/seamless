/**
 * Layers a dark gradient over the chosen photo so the overlaid text stays
 * readable, and falls back to the plain face background when no image is set.
 */
export const getBackgroundStyle = backgroundImage => {
    if (!backgroundImage?.url) {
        return {};
    }

    return {
        backgroundImage: `linear-gradient(to bottom, rgba(20, 22, 14, 0) 35%, rgba(20, 22, 14, 0.88) 92%), url(${backgroundImage.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    };
};
