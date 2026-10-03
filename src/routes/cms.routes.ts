import { Router } from 'express';
import { cmsController } from '../controllers/cms';

export const cmsRouter = Router();

// Public CMS endpoints
cmsRouter.get('/pages/:slug', (req, res, next) => {
  cmsController.getPage(req, res, next);
});

cmsRouter.get('/banners', (req, res, next) => {
  cmsController.getBanners(req, res, next);
});

cmsRouter.get('/navigation', (req, res, next) => {
  cmsController.getNavigation(req, res, next);
});
