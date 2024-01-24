require('dotenv').config();

exports.getGames = async (query) => {   
    try {
        const response = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Client-ID": process.env.CLIENT_ID,
                "Authorization": process.env.AUTHORIZATION
            },
            body: query,
        });
        if (!response.ok) {
            console.log("Error response is", response);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        //if no errors, then proceed
        const games = await response.json();
        return games;
    }//try block

    catch (e) {
        console.log("error is", e.message);
        return e;
    }//catch
};

