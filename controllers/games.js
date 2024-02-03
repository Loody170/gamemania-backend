const { getGames } = require('../http');
const { processedGames } = require('./categories');

exports.getGameDetails = async (req, res, next) => {
    const { id } = req.params;
    const queryBody = `
fields name, cover.image_id, first_release_date,involved_companies.company.name, 
involved_companies.developer, involved_companies.publisher, genres.name,
platforms.name, summary, rating, rating_count, player_perspectives.name, themes.name, game_engines.name,
game_modes.name, screenshots.image_id, videos.video_id, websites.category, websites.url;
where id=${id};    
`;

    try {
        console.log("Getting game details for", id);
        const gameDetails = await getGames(queryBody, req.token );
        const filteredGameDetails = processGameDetails(gameDetails);
        res.status(200).json({
            message: 'Fetched game details successfully.',
            data: filteredGameDetails,
        });
        console.log("Game details for", id, "fetched and sent successfully");
    }//try block
    catch (e) {
        console.log("error is", e.message);
        res.status(500).send('Error');
    }//catch
}

exports.getSimilarGames = async (req, res, next) => {
    const id = req.query.id;
    console.log("getting similar games for game with id", id);
    const queryBody = `
fields similar_games.name, similar_games.cover.image_id, similar_games.genres.name, similar_games.platforms.name;
where themes != (42) & id=${id};
limit 10;    
`;

    try {
        const similarGames = await getGames(queryBody, req.token);
        const filteredSimilarGames = processSimilarGames(similarGames[0].similar_games);
        res.status(200).json({
            message: 'Fetched similar games successfully.',
            data: filteredSimilarGames,
        });
        console.log("after calling similar games and responding");
    }//try block
    catch (e) {
        console.log("error is", e.message);
        return next(e);
    }//catch
}

exports.getSearchResults = async (req, res, next) => {
    const { query } = req.query;
    const queryBody = `
fields name, cover.image_id,first_release_date;
search "${query}";
where themes != (42) & category != (1, 2, 3, 5, 10, 12, 13, 14);
limit 5;
`;

    try {
        console.log("Getting search results for", query);
        const searchResults = await getGames(queryBody, req.token);

        const filteredSearchResults = searchResults.map((game) => {
            const { id, name, cover, first_release_date } = game;

            // Check if cover and first_release_date exist
            const releaseYear = first_release_date
                ? new Date(first_release_date * 1000).getFullYear()
                : '';

            const coverImageUrl = cover
                ? `https://images.igdb.com/igdb/image/upload/t_1080p/${cover.image_id}.jpg`
                : '';

            return {
                id,
                name: name || '',
                releaseYear,
                coverImageUrl,
            };
        });

        res.status(200).json({
            message: 'Fetched search results successfully.',
            data: filteredSearchResults,
        });
        console.log("Search results for", query, "fetched and sent successfully");
    }//try block
    catch (e) {
        console.log("error is", e.message);
        return next(e);
    }//catch
}

exports.getAllSearchResults = async (req, res, next) => {
    const { query } = req.query;
    const queryBody = `
fields name, cover.image_id, first_release_date, rating, rating_count;
search "${query}";
where themes != (42) & category != (1, 2, 3, 5, 10, 12, 13, 14);
limit 30;
`;

    try {
        console.log("Getting all search results for", query);
        const allSearchResults = await getGames(queryBody, );
        const processedAllSearchResults = processedGames(allSearchResults);
        res.status(200).json({
            message: 'Fetched search results successfully.',
            data: processedAllSearchResults,
        });
        console.log("All search results for", query, "fetched and sent successfully");
    }//try block
    catch (e) {
        console.log("error is", e.message);
        return next(e);
    }//catch
}

const processGameDetails = (gameDetails) => {
    if (!gameDetails || gameDetails.length === 0) {
        return null; // Return early if gameDetails is null or empty
    }

    const {
        id, cover, first_release_date, game_engines, game_modes, genres, 
        involved_companies, name, platforms, player_perspectives, rating,
        rating_count, screenshots, videos, summary, themes, websites, 
    } = gameDetails[0];

    // Extract image URL for the cover, if available
    const imageUrl = cover
        ? `https://images.igdb.com/igdb/image/upload/t_1080p/${cover.image_id}.jpg`
        : null;

    // Convert first_release_date to human-readable form
    const releaseDate = first_release_date
        ? new Date(first_release_date * 1000).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        })
        : '';

    // Extract developer and publisher names with checks
    const developer = involved_companies?.find((company) => company.developer)?.company?.name || '';
    const publisher = involved_companies?.find((company) => company.publisher)?.company?.name || '';

    // Extract game engine names with check
    const gameEnginesNames = game_engines?.map((engine) => engine.name) || [];

    // Extract themes names with check
    const themesNames = themes?.map((theme) => theme.name) || [];

    // Extract genres names with check
    const genresNames = genres?.map((genre) => genre.name) || [];

    // Extract platforms names with check
    const platformsNames = platforms?.map((platform) => platform.name) || [];

    // Extract player perspectives names with check
    const playerPerspectivesNames = player_perspectives?.map((perspective) => perspective.name) || [];

    // Extract gamemodes names with check
    const gamemodesNames = game_modes?.map((mode) => mode.name) || [];

    // Extract screenshots URLs with check
    const screenshotsUrls =
        screenshots?.map((screenshot) =>
            `https://images.igdb.com/igdb/image/upload/t_1080p/${screenshot.image_id}.jpg`)
        || [];

    // Extract videos IDs with check
    const videosIds =
        videos?.map((video) =>
            video.video_id)
        || [];
        const gameWebsites = websites && websites.length > 0 ? websites : []

    // Return the processed data
    return {
        id,
        imageUrl,
        screenshotsUrls,
        videosIds,
        mainDetails: {
            name,
            releaseDate,
            developer,
            genresNames,
            platformsNames,
            summary,
            rating: Math.floor(rating),
            rating_count,
            gameWebsites,
        },
        extraDetails: {
            themesNames,
            publisher,
            gamemodesNames,
            playerPerspectivesNames,
            gameEnginesNames,
        }
    };
};

const processSimilarGames = (games) => {
    if (!games || games.length === 0) {
        return null;
    }

    return games.map((game) => {
        const { id, name, cover, genres, platforms } = game;
        // Extract image URL for the cover, if available
        const coverImageUrl = cover
            ? `https://images.igdb.com/igdb/image/upload/t_1080p/${cover.image_id}.jpg`
            : null;

        // Extract names of genres
        const genresNames = genres ? genres.map((genre) => genre.name) : [];

        // Extract names of platforms
        const platformsNames = platforms ? platforms.map((platform) => platform.name) : [];

        return {
            id,
            name,
            coverImageUrl,
            genres: genresNames,
            platforms: platformsNames,
        };
    });
};
