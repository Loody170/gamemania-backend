const { getGames } = require('../http');

exports.getNewGames = async (req, res, next) => {
  const newReleasesRequestBody = getNewReleasesQuery();
  try {
    console.log("before getting new games and calling");
    const newReleases = await getGames(newReleasesRequestBody);
    console.log(newReleases);
    const filteredNewReleases = processGameData(newReleases);
    // const arrangedNewReleases = arrangeByLatestRelease(filteredNewReleases);
    res.status(200).json({
      message: 'Fetched new games successfully.',
      data: filteredNewReleases,
    });
    console.log("after calling new games and responding");
  }//try block
  catch (e) {
    console.log("error is", e.message);
    res.status(500).send('Error');
  }//catch
}

exports.getUpcomingGames = async (req, res, next) => {
  const upcomingGamesRequestBody = getUpcomingGamesQuery();
  try {
    console.log("before getting upcoming games and calling");
    const upcomingGamesRequestBody = getUpcomingGamesQuery();
    const upcomingGames = await getGames(upcomingGamesRequestBody);
    const filteredUpcomingGames = processGameData(upcomingGames);
    res.status(200).json({
      message: 'Fetched upcoming games successfully.',
      data: filteredUpcomingGames,
    });
    console.log("after calling upcoming games and responding");
  }//try block
  catch (e) {
    console.log("error is", e.message);
    res.status(500).send('Error');
  }//catch
}

exports.getRecentTopGames = async (req, res, next) => {
  const recentTopGamesBody = getRecentTopGamesQuery();
  try {
    console.log("before getting top games and calling");
    const recentTopGames = await getGames(recentTopGamesBody);
    console.log(recentTopGames);
    const filteredRecentTopGames = processGameData(recentTopGames);
    res.status(200).json({
      message: 'Fetched recent top games successfully.',
      data: filteredRecentTopGames,
    });
    console.log("after calling top games and responding");
  }//try block
  catch (e) {
    console.log("error is", e.message);
    res.status(500).send('Error');
  }//catch
}

exports.getBestGames = async (req, res, next) => {
  const platform = req.query.platform;

  if (!platform) {
    return res.status(400).json({ error: 'Platform is required' });
  }
  let queryConditions = "";
  if (platform === "playstation") {
    queryConditions = `
    where platforms = (48, 167) & platforms != (169, 49, 9,130 )  &
     category != (1, 2, 5, 10) & rating != null & rating_count >100;
     `;
  }
  else if (platform === "xbox") {
    queryConditions = `
    where platforms = (169, 49) & platforms != (9, 130, 48, 167) 
    & category != (1, 2, 5, 10) & rating != null & rating_count >100; 
     `;
  }
  else if (platform === "switch") {
    queryConditions = `
    where platforms = (130) & platforms != ( 9, 48, 167,169,49)  
    & category != (1, 2, 5, 10) & rating != null & rating_count >100; 
     `;
  }
  else{
    return res.status(400).json({ error: 'Incorrect platform' });
  }
  const queryBody = `
  fields name, cover.image_id, rating, rating_count, platforms.name;
  ${queryConditions}
  sort rating desc;
  limit 10;
  `;
  try {
    console.log("before getting best games and calling");
    const bestGames = await getGames(queryBody);
    console.log(bestGames);
    res.status(200).json({
      message: 'Fetched best games successfully.',
      data: bestGames,
    });
    console.log("after calling best and responding");
  }//try block
  catch (e) {
    console.log("error is", e.message);
    res.status(500).send('Error');
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
    if (!rating) {
      console.log("rating is null");
    }
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

const getNewReleasesQuery = () => {
  // Calculate a date representing the last 30 days in Unix timestamp format
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30;
  //   const requestBody = `
  // fields name, cover.image_id, genres.name, rating, release_dates.date, release_dates.human, release_dates.platform.name, release_dates.platform.platform_logo.image_id; 
  // where release_dates.date > ${thirtyDaysAgo} & release_dates.date <= ${Math.floor(Date.now() / 1000)}; 
  // sort release_dates.human desc; 
  // limit 10;
  // `;

  const requestBody = `
fields name, cover.image_id, genres.name, rating, first_release_date, platforms.name;
where  first_release_date > ${thirtyDaysAgo} & first_release_date <= ${Math.floor((new Date() - 2 * 24 * 60 * 60 * 1000) / 1000)} &
release_dates.platform = (167,169,6,48,49,130) & category != (1, 2, 5, 10); 
sort first_release_date desc;
limit 10;
`
  return requestBody;
};

const getUpcomingGamesQuery = () => {
  // Calculate a date representing the last 30 days in Unix timestamp format
  const fourteenDaysLater = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14;
  const requestBody = `
fields name, cover.image_id, genres.name, rating, first_release_date, platforms.name;
where first_release_date > ${Math.floor(Date.now() / 1000)} & first_release_date <= ${fourteenDaysLater} &
release_dates.platform = (167,169,6,48,49,130) & category != (1, 2, 5, 10); 
sort first_release_date desc;
limit 10;
`;
  return requestBody;
};

const getRecentTopGamesQuery = () => {
  // Calculate a date representing the last 30 days in Unix timestamp format
  const sixtyDaysBefore = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 60;
  const requestBody = `
fields name, cover.image_id, genres.name, rating, first_release_date, platforms.name;
where first_release_date > ${sixtyDaysBefore} & first_release_date <= ${Math.floor(Date.now() / 1000)} &
release_dates.platform = (167,169,6,48,49,130) & category != (1, 2, 5, 10) & rating != null; 
sort rating desc;
limit 10;
`;
  return requestBody;
};





// Function to filter and process the data
// const processGameData = (games) => {
//   const currentDate = new Date();
//   const thirtyDaysAgo = currentDate.setDate(currentDate.getDate() - 30);

//   // Filter and process each game
//   const filteredGames = games.map((game) => {
//     const { id, cover, genres, name, rating, release_dates } = game;

//     // Filter release dates for the last 30 days
//     const recentReleaseDates = release_dates
//       .filter((release) => release.date * 1000 > thirtyDaysAgo)
//       .map((release) => ({
//         date: release.date,
//         human: release.human,
//       }));

//     // Generate image URL for the cover, if available
//     const coverImageUrl = cover
//       ? `https://images.igdb.com/igdb/image/upload/t_1080p/${cover.image_id}.jpg`
//       : null;

//     // Extract platform information of the recent release dates
//     const recentPlatforms = release_dates
//       .filter((release) => release.date * 1000 > thirtyDaysAgo)
//       .map((release) => {
//         const { platform } = release;

//         return {
//           id: platform.id,
//           name: platform.name,
//         };
//       });

//     return {
//       id,
//       name,
//       coverImageUrl,
//       genres: genres.map((genre) => genre.name),
//       rating,
//       recentReleaseDates,
//       recentPlatforms,
//     };
//   });

//   return filteredGames;
// };

// function arrangeByLatestRelease(filteredArray) {
//   // Sort the array based on the latest release date
//   filteredArray.sort((a, b) => {
//     const dateA = a.recentReleaseDates[0].date;
//     const dateB = b.recentReleaseDates[0].date;
//     return dateB - dateA; // Sort in descending order
//   });

//   return filteredArray;
// }

// function to prepare the array by filtering then arranging it by calling their respective functions
// const prepareArray = (gamesList) => {
//   const filteredList = processGameData(gamesList);
//   const arrangedList = arrangeByLatestRelease(filteredList);
//   return arrangedList;
// };