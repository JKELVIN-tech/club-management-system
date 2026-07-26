import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as reportingService from './reporting.service';

export const membership = asyncHandler(async (req: Request, res: Response) => {
  const data = await reportingService.getMembershipReport();
  res.json(data);
});

export const financial = asyncHandler(async (req: Request, res: Response) => {
  const data = await reportingService.getFinancialReport();
  res.json(data);
});

export const events = asyncHandler(async (req: Request, res: Response) => {
  const data = await reportingService.getEventsReport();
  res.json(data);
});

export const overview = asyncHandler(async (req: Request, res: Response) => {
  const data = await reportingService.getOverviewReport();
  res.json(data);
});
