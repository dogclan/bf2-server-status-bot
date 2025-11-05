import StatusBot, { BotTreatment } from '../lib/bot';
import Config from '../lib/config';
import logger from '../lib/logger';

logger.info('Starting status bot for', Config.SERVER_IP + ':' + Config.SERVER_PORT);
const bot = new StatusBot({
    token: Config.TOKEN,
    serverIp: Config.SERVER_IP,
    serverPort: Config.SERVER_PORT,
    botTreatment: Config.BOT_TREATMENT as BotTreatment,
    updateUsername: Config.UPDATE_USERNAME
});
bot.run()
    .catch((error) => {
        if (error instanceof Error) {
            error = error.message;
        }
        logger.fatal(error);
    });
