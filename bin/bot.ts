import StatusBot, { BotTreatment } from '../lib/bot';
import Config from '../lib/config';
import logger from '../lib/logger';

logger.info('Starting status bot');
const bot = new StatusBot(Config.TOKEN, Config.SERVER_IP, Config.SERVER_PORT, Config.BOT_TREATMENT as BotTreatment, Config.UPDATE_USERNAME);
