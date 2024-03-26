const { Telegraf, Input} = require('telegraf');
const axios = require('axios');
const { MongoClient } = require('mongodb');
const { message } = require('telegraf/filters');

const bot = new Telegraf('6225753612:AAFBiJvjsdaVp4WszG7HbIVwmdi2cuicJyY');
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const COINGECKO_API_KEY = 'CG-bxn6j4oRNCW2S3H6oq9Knye8';
const uri = "mongodb+srv://lukaajdukovicla:<JF7|GFpCQZ7FF1wO>@pneuma.spoggxv.mongodb.net/?retryWrites=true&w=majority&appName=pneuma";

bot.command('help', (ctx)=>{
    ctx.reply('List of commands: \n/help for help. \n/trending for trending coins. \n/status for API status. \n/price --coin-- for coin price. \n/history --coin--DD-MM-YYYY-- for coin price on given date.')

});

bot.command('trending', async (ctx) =>{

    try {
        const response = await axios.get(`${COINGECKO_API_URL}/search/trending`);
        const data = response.data.coins;

        const trendingCoins = data.map(coin => coin.item.name).join(', ');
        ctx.reply(`Trending coins: ${trendingCoins}.`);

    }catch (error){
        console.error('trending command error', error);
        ctx.reply('An error occurred while fetching cryptocurrency data.');
    }
});


bot.command('price', async (ctx) => {

    const cryptocurrency = ctx.message.text.split(' ')[1]; // Extract cryptocurrency from the command
    if (!cryptocurrency) {
        return ctx.reply('Please provide a valid cryptocurrency.');
    }

    try {
        const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
            params: {
                ids: cryptocurrency,
                vs_currencies: 'usd',
                include_market_cap: true,
                include_24hr_vol: true,
            },
            headers: {
                'Content-Type': 'application/json',
                'X-CoinGecko-API-Key': COINGECKO_API_KEY
            }
        });

        const data = response.data[cryptocurrency];
        if (!data) {
            return ctx.reply('Cryptocurrency data not found.');
        }

        const price = data.usd;
        const marketCap = data.usd_market_cap;
        const volume = data.usd_24h_vol;

        ctx.reply(`Price of ${cryptocurrency}: $${price}. \nMarket cap of ${cryptocurrency}: $${marketCap}. \n24hr_vol of ${cryptocurrency}: $${volume}.`);

    } catch (error) {
        console.error('price command error', error);
        ctx.reply('An error occurred while fetching cryptocurrency data.');
    }
});

bot.command('status', async (ctx) => {

    try{
        const repsone = await axios.get(`${COINGECKO_API_URL}/ping`);
        ctx.reply('API servers are up and running,.');

    } catch (error){
        console.error('status command error', error);
        ctx.reply('API servers are down.');
    }
});

bot.command('history', async (ctx) => {
    const cryptocurrency = ctx.message.text.split(' ')[1]; // Extract cryptocurrency from the command
    const reqdate = ctx.message.text.split(' ')[2];

    if (!cryptocurrency || !reqdate) {
        return ctx.reply('Please provide a valid cryptocurrency and date (DD-MM-YYYY).');
    }

    try {
        const response = await axios.get(`${COINGECKO_API_URL}/coins/${cryptocurrency}/history`, {
            params: {
                date: reqdate,
                localization: false
            },
            headers: {
                'Content-Type': 'application/json',
                'X-CoinGecko-API-Key': COINGECKO_API_KEY
            }
        });

        const data = response.data;

        if (!data) {
            return ctx.reply(`No historical data found for ${cryptocurrency} on ${reqdate}.`);
        }

        const marketData = data.market_data;
        const currntPrice = marketData.current_price;
        const usdCurrentPrice = currntPrice.usd;

        ctx.reply(`Price of ${cryptocurrency} on ${reqdate} was equal to $${usdCurrentPrice}.`);

        // Further processing of market data...
    } catch (error) {
        console.error('history command error', error);
        ctx.reply('An error occurred while fetching historical market data.');
    }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));