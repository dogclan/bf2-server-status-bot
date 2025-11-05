import axios from 'axios';
import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
import * as cron from 'node-cron';
import { Logger } from 'tslog';
import logger from './logger';
import { ensureStringMaxLength } from './utility';

export type Config = {
    token: string
    serverIp: string
    serverPort: string
    botTreatment: BotTreatment
    updateUsername: boolean
}
export type BotTreatment = 'ignore' | 'separate' | 'subtract-slots' | 'include'

type BflistServer = {
    name: string
    mapName: string
    numPlayers: number
    maxPlayers: number
    players: BflistPlayer[]
}
type BflistPlayer = {
    pid: number
    name: string
    tag: string
    score: number
    kills: number
    deaths: number
    ping: number
    team: number
    teamLabel: string
    aibot: boolean
}

class StatusBot {
    private readonly config: Config;

    private client: Client;
    private updateTask: cron.ScheduledTask;
    private logger: Logger;
    private currentActivityName = '';
    private currentAvatarUrl = '';

    constructor(config: Config) {
        this.config = config;

        this.logger = logger.getChildLogger({ name: 'BotLogger'});
        this.client = new Client({ intents: [GatewayIntentBits.Guilds] });

        this.updateTask = cron.createTask('*/2 * * * *', async () => {
            this.logger.info('Updating game server status');
            try {
                await this.updateServerStatus();
                this.logger.debug('Game server status update complete');
            }
            catch(e) {
                this.logger.error('Failed to update game server status', e instanceof Error ? e.message : e);
            }
        });
    }

    public async run(): Promise<void> {
        this.client.once('clientReady', () => {
            this.logger.info('Client is ready, starting update task');
            this.updateTask.start();
        });

        logger.info('Logging into Discord using token');
        await this.client.login(this.config.token);
    }

    private async updateServerStatus(): Promise<void> {
        this.logger.debug('Fetching server status from bflist');
        const resp = await axios.get(`https://api.bflist.io/bf2/v1/servers/${this.config.serverIp}:${this.config.serverPort}`);
        const server: BflistServer = resp.data;
        const { name, mapName, numPlayers, maxPlayers } = server;

        this.logger.debug('Filtering out bots to determine player count');
        // Only count players who: are not flagged as a bot and have a valid ping, score, kill total of death total
        const playerFilter = (player: BflistPlayer) => !player.aibot && (player.ping > 0 || player.score != 0 || player.kills != 0 || player.deaths != 0);
        const players: number = server?.players?.filter(playerFilter)?.length;
        const bots: number = server?.players?.length - players;

        let playerIndicator: string;
        switch (this.config.botTreatment) {
            case 'ignore':
                playerIndicator = `${players}/${maxPlayers}`;
                break;
            case 'separate':
                playerIndicator = `${players}(${bots})/${maxPlayers}`;
                break;
            case 'subtract-slots':
                playerIndicator = `${players}/${maxPlayers - bots}`;
                break;

            default:
                playerIndicator = `${numPlayers}/${maxPlayers}`;
        }

        const activityName = `${playerIndicator} - ${mapName}`;
        if (activityName != this.currentActivityName) {
            this.logger.debug('Updating user activity', activityName);
            try {
                this.client.user?.setActivity(activityName, { type: ActivityType.Playing });
                this.currentActivityName = activityName;
            }
            catch (e) {
                this.logger.error('Failed to update user activity', e instanceof Error ? e.message : e);
            }
        }
        else {
            this.logger.debug('Activity name is unchanged, no update required');
        }

        const username = ensureStringMaxLength(name, 32);
        if (username != this.client.user?.username && this.config.updateUsername) {
            this.logger.debug('Updating username to match server name');
            try {
                await this.client.user?.setUsername(username);
            }
            catch (e) {
                this.logger.error('Failed to update username', e instanceof Error ? e.message : e);
            }
        }
        else {
            this.logger.debug('Username matches server name, no update required');
        }
        
        const mapImgSlug = mapName.toLowerCase().replace(/ /g, '_');
        const mapImgUrl = `https://cdn.gametools.network/maps/bf2/${mapImgSlug}.jpg`;
        if (mapImgUrl != this.currentAvatarUrl) {
            this.logger.debug('Updating user avatar', mapImgUrl);
            try {
                await this.client.user?.setAvatar(mapImgUrl);
                this.currentAvatarUrl = mapImgUrl;
            }
            catch (e) {
                this.logger.error('Failed to update user avatar', e instanceof Error ? e.message : e);
            }
        }
    }
}

export default StatusBot;
