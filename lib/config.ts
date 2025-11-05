import path from 'path';

export default abstract class Config {
    static readonly ROOT_DIR: string = path.join(__dirname, '..', '..');
    static readonly LOG_LEVEL: string = process.env.LOG_LEVEL || 'info';
    static readonly TOKEN: string = process.env.TOKEN || '';
    static readonly SERVER_IP: string = process.env.SERVER_IP || '';
    static readonly SERVER_PORT: string = process.env.SERVER_PORT || '16567';
    static readonly BOT_TREATMENT: string = process.env.BOT_TREATMENT || 'ignore';
    static readonly UPDATE_USERNAME: boolean = !!Number(process.env.UPDATE_USERNAME || 0);
}
