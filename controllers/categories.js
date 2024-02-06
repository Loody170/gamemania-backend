const { getGames } = require('../http');

exports.getCategoryGames = async (req, res, next) => {
    const { type, slug } = req.params;
    const {page, limit, sort} = req.query;
    console.log("type", type, "slug", slug);
    console.log("page", page, "limit", limit,"offset", (page-1)*limit, "sort", sort, );
    
    let condition="";
    if(type==="genres"){
        condition=`genres.slug="${slug}"`;
    }
    else if(type==="themes"){
        condition=`themes.slug="${slug}"`;
    }
    else if(type==="platforms"){
        condition=`platforms.slug="${slug}"`;
    }
    const sortCondition = getSortCondition(sort);

    const queryBody = `
    fields name, cover.image_id, first_release_date, rating, rating_count;
    where themes != (42) & ${condition} & first_release_date <= ${Math.floor(Date.now() / 1000)};
    sort ${sortCondition};
    limit ${limit};
    offset ${(page-1)*limit};
`;
    try {
        console.log("Getting category games for", type, slug);
        const games = await getGames(queryBody, req.token);
        const filteredGames = exports.processedGames(games);
        res.status(200).json({
            message: 'Fetcheds games successfully.',
            data: filteredGames,
        });
        console.log("Category games for", type, slug, "fetched and sent successfully");
    }//try block
    catch (e) {
        console.log("error is", e.message);
        next(e);
    }//catch
}


exports.processedGames = (games) => {
    return games.map((game) => {
      const { id, name, first_release_date, cover, rating } = game;
  
      // Check if cover is present and has image_id
      const coverImageUrl = cover && cover.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_cover_med/${cover.image_id}.jpg`
        : '';
  
      // Check if release date is present
      const releaseDate =
        first_release_date
          ? new Date(first_release_date * 1000).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })
          : '';
  
      // Check if rating is present
      const gameRating = rating !== undefined && !isNaN(rating)
        ? Math.floor(rating)
        : '';
  
      return {
        id,
        name: name || '',
        releaseDate,
        coverImageUrl,
        gameRating
      };
    });
  };
  
  function getSortCondition(sort) {
    let sortCondition = "";
    switch(sort) {
        case "rating-desc":
            sortCondition = "rating desc";
            break;
        case "title-asc":
            sortCondition = "name asc";
            break;
        case "title-desc":
            sortCondition = "name desc";
            break;
            case "newest":
            sortCondition = "first_release_date desc";
            break;
        case "oldest":
            sortCondition = "first_release_date asc";
            break;
        default:
            sortCondition = "rating desc"; // default sort condition if none matches
    }
    return sortCondition;
}