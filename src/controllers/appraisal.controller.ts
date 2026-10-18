import { Request, Response, NextFunction } from 'express';
import * as appraisalService from '../services/appraisal.service';

export const listAdminAppraisals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await appraisalService.listAdminAppraisals(req.query as any);
    res.status(200).json({
      status: 'success',
      connected: true,
      data: result,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppraisalStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await appraisalService.listAdminAppraisals({});
    res.status(200).json({
      status: 'success',
      data: { stats: result.stats },
      stats: result.stats,
    });
  } catch (error) {
    next(error);
  }
};

export const createAppraisal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await appraisalService.createAppraisal(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Appraisal code created successfully',
      data: { appraisal: item, item },
      appraisal: item,
      item,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppraisalById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { appraisal, submission, isSubmission } = await appraisalService.getAppraisalOrSubmissionById(id);
    res.status(200).json({
      status: 'success',
      data: {
        appraisal,
        submission,
        item: isSubmission ? submission : appraisal,
      },
      appraisal,
      submission,
      item: isSubmission ? submission : appraisal,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppraisal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const item = await appraisalService.updateAppraisal(id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Appraisal updated successfully',
      data: { appraisal: item, item },
      appraisal: item,
      item,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAppraisal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    await appraisalService.deleteAppraisal(id);
    res.status(200).json({
      status: 'success',
      message: 'Appraisal record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const clearAppraisals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const scope = (req.body?.scope || req.query?.scope || 'all') as 'all' | 'certificates' | 'submissions';
    const result = await appraisalService.clearAppraisals(scope);
    res.status(200).json({
      status: 'success',
      message: `Cleared ${result.count} appraisal records successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const resetAppraisals = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await appraisalService.resetAppraisalsToDefaults();
    res.status(200).json({
      status: 'success',
      message: 'Appraisals reset to platform defaults successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const submitCustomerAppraisal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const submission = await appraisalService.submitCustomerAppraisal(req.body);
    const refId = submission.referenceId || `#${submission.id}`;
    res.status(201).json({
      status: 'success',
      message: 'Your jewelry appraisal submission was received successfully! Our gemology team has logged your photos and details for appraisal.',
      referenceId: refId,
      id: submission.id,
      data: {
        submission,
        referenceId: refId,
        id: submission.id,
      },
      submission,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const submission = await appraisalService.getSubmissionById(id);
    res.status(200).json({
      status: 'success',
      data: { submission, item: submission },
      submission,
      item: submission,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomerSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const submission = await appraisalService.updateCustomerSubmission(id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Customer submission updated successfully',
      data: { submission },
      submission,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomerSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    await appraisalService.deleteAppraisal(id);
    res.status(200).json({
      status: 'success',
      message: 'Customer submission deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const lookupAppraisalCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const code = String(req.params.code || req.query.code || '');
    const result = await appraisalService.lookupAppraisalCode(code);
    if (!result.success) {
      res.status(404).json({
        status: 'error',
        success: false,
        message: result.error,
        error: result.error,
      });
      return;
    }
    res.status(200).json({
      status: 'success',
      success: true,
      data: result.data,
      appraisal: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const appraisalController = {
  listAdminAppraisals,
  getAppraisalStats,
  createAppraisal,
  getAppraisalById,
  getSubmissionById,
  updateAppraisal,
  deleteAppraisal,
  clearAppraisals,
  resetAppraisals,
  submitCustomerAppraisal,
  updateCustomerSubmission,
  deleteCustomerSubmission,
  lookupAppraisalCode,
};
