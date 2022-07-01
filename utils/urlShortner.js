const getTinyUrl = async() => {
    const data = await fetch("https://api.tinyurl.com/create", {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "url": "https://hackerspace-fileshare.herokuapp.com/"
        })
    })

    const json = await data.json();
    console.log(json);
}

module.exports = getTinyUrl;