import { Request, Response, NextFunction } from 'express';
import * as settingsService from '../services/settings.service';

/**
 * Get all system settings (Admin)
 */
export const getSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await settingsService.getSettings();
    res.status(200).json({
      status: 'success',
      data: {
        settings,
        ...settings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update system settings (Admin)
 */
export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await settingsService.updateSettings(req.body);
    res.status(200).json({
      status: 'success',
      message: 'System settings saved successfully',
      data: {
        settings,
        ...settings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset system settings to system defaults (Admin)
 */
export const resetSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await settingsService.resetSettings();
    res.status(200).json({
      status: 'success',
      message: 'System settings reset to defaults successfully',
      data: {
        settings,
        ...settings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get public-safe system settings (Public)
 */
export const getPublicSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const publicSettings = await settingsService.getPublicSettings();
    res.status(200).json({
      status: 'success',
      data: publicSettings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available onboarding starter kits (Public/Reps)
 */
export const getStarterKits = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const starterKits = await settingsService.getStarterKits();
    res.status(200).json({
      status: 'success',
      data: {
        starterKits,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const settingsController = {
  getSettings,
  updateSettings,
  resetSettings,
  getPublicSettings,
  getStarterKits,
};
