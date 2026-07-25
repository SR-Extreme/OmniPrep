import type { Request, Response } from 'express';
import { getPlatformStats } from './platform.service.js';

export async function getPlatformStatsHandler(
    _req: Request,
    res: Response,
): Promise<void> {
    try {
        const stats = await getPlatformStats();
        res.status(200).json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
