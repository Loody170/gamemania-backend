const { getGames } = require('../http');

exports.getAnticipatedGames = async (req, res, next) => {
  const anticipatedGamesRequestBody = getAnticipatedGamesQuery();
  try {
    console.log("Getting anticipated games");
    const anticipatedGames = await getGames(anticipatedGamesRequestBody, req.token);
    const filteredAnticipatedGames = processGameData(anticipatedGames);
    // const arrangedNewReleases = arrangeByLatestRelease(filteredNewReleases);
    res.status(200).json({
      message: 'Fetched anticipated games successfully.',
      data: filteredAnticipatedGames,
    });
    console.log("Anticipated games fetched and sent successfully");
  }//try block
  catch (e) {
    console.log("error is", e.message);
    next(e);
  }//catch
}

exports.getUpcomingGames = async (req, res, next) => {
  const upcomingGamesRequestBody = getUpcomingGamesQuery();
  try {
    console.log("Getting upcoming games");
    const upcomingGamesRequestBody = getUpcomingGamesQuery();
    const upcomingGames = await getGames(upcomingGamesRequestBody, req.token);
    const filteredUpcomingGames = processGameData(upcomingGames);
    res.status(200).json({
      message: 'Fetched upcoming games successfully.',
      data: filteredUpcomingGames,
    });
    console.log("Upcoming games fetched and sent successfully");
  }//try block
  catch (e) {
    console.log("error is", e.message);
    return next(e);
  }//catch
}

exports.getRecentTopGames = async (req, res, next) => {
  const recentTopGamesBody = getRecentTopGamesQuery();
  try {
    console.log("before getting top games and calling");
    const recentTopGames = await getGames(recentTopGamesBody, req.token);
    const filteredRecentTopGames = processGameData(recentTopGames);
    res.status(200).json({
      message: 'Fetched recent top games successfully.',
      data: filteredRecentTopGames,
    });
    console.log("after calling top games and responding");
  }//try block
  catch (e) {
    console.log("error is", e.message);
    return next(e);
  }//catch
}

exports.getBestGames = async (req, res, next) => {
  const platform = req.query.platform;

  if (!platform) {
    const error = new Error('Platform is required');
    error.statusCode = 400;
    return next(error);
  }
  let queryConditions = "";
  if (platform === "playstation") {
    queryConditions = `
    where themes != (42) & platforms = (48, 167) & platforms != (169, 49, 9,130 )  &
     category != (1, 2, 5, 10) & rating != null & rating_count >100;
     `;
  }
  else if (platform === "xbox") {
    queryConditions = `
    where themes != (42) & platforms = (169, 49) & platforms != (9, 130, 48, 167) 
    & category != (1, 2, 5, 10) & rating != null & rating_count >100; 
     `;
  }
  else if (platform === "switch") {
    queryConditions = `
    where themes != (42) & platforms = (130) & platforms != ( 9, 48, 167,169,49)  
    & category != (1, 2, 5, 10) & rating != null & rating_count >100; 
     `;
  }
  else {
    const error = new Error('incorrect platform');
    error.statusCode = 400;
    return next(error);
  }
  const queryBody = `
  fields name, cover.image_id, rating, rating_count, platforms.name;
  ${queryConditions}
  sort rating desc;
  limit 10;
  `;
  try {
    console.log("Getting best games for", platform);
    const bestGames = await getGames(queryBody, req.token);
    res.status(200).json({
      message: 'Fetched best games successfully.',
      data: bestGames,
    });
    console.log("Best games for", platform, "fetched and sent successfully");
  }//try block
  catch (e) {
    console.log("error is", e.message);
    return next(e);
  }//catch
}

// Function to filter and process the data(updated)
const processGameData = (games) => {
  return games.map((game) => {
    const { id, cover, genres, name, rating, first_release_date, platforms } = game;

    // Extract image URL for the cover, if available
    const coverImageUrl = cover
      ? `https://images.igdb.com/igdb/image/upload/t_1080p/${cover.image_id}.jpg`
      : null;

    // Extract names of genres
    const genresNames = genres ? genres.map((genre) => genre.name) : [];

    // Extract names of platforms
    const platformsNames = platforms ? platforms.map((platform) => platform.name) : [];

    // Format first_release_date into a human-readable date
    const date = new Date(first_release_date * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    // if (!rating) {
    //   console.log("rating is null");
    // }
    // Creating the processed game object
    return {
      id,
      name,
      coverImageUrl,
      genres: genresNames,
      platforms: platformsNames,
      date,
      rating,
    };
  });
};

const getAnticipatedGamesQuery = () => {
  // Calculate a date representing the next 90th day in Unix timestamp format
  const threeMonthsLater = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 90;
  const requestBody = `
  fields name, cover.image_id, genres.name, rating, first_release_date, platforms.name;
  where themes != (42) & first_release_date > ${Math.floor(Date.now() / 1000)} & first_release_date <= ${threeMonthsLater} &
  release_dates.platform = (167,169,6,48,49,130) & category != (1, 2, 5, 10);
  sort hypes desc;
  limit 10;
  `
  return requestBody;
};

const getUpcomingGamesQuery = () => {
  // Calculate a date representing the next 14th day in Unix timestamp format
  const fourteenDaysLater = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14;
  const requestBody = `
fields name, cover.image_id, genres.name, rating, first_release_date, platforms.name;
where themes != (42) & first_release_date > ${Math.floor(Date.now() / 1000)} & first_release_date <= ${fourteenDaysLater} &
release_dates.platform = (167,169,6,48,49,130) & category != (1, 2, 5, 10); 
sort first_release_date desc;
limit 10;
`;
  return requestBody;
};

const getRecentTopGamesQuery = () => {
  // Calculate a date representing the last 60 days in Unix timestamp format
  const sixtyDaysBefore = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 60;
  const requestBody = `
fields name, cover.image_id, genres.name, rating, first_release_date, platforms.name;
where themes != (42) & first_release_date > ${sixtyDaysBefore} & first_release_date <= ${Math.floor(Date.now() / 1000)} &
release_dates.platform = (167,169,6,48,49,130) & category != (1, 2, 5, 10) & rating != null; 
sort rating desc;
limit 10;
`;
  return requestBody;
};