import { Request, Response, NextFunction } from 'express';
import { cmsService } from '../../services/cms.service';

export class CmsController {
  async getPage(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = String(req.params.slug);
      const page = await cmsService.getPageBySlug(slug);
      if (!page) {
        return res.status(404).json({
          status: 'fail',
          message: 'CMS page not found',
        });
      }
      res.json({
        status: 'success',
        data: { page },
      });
    } catch (error) {
      next(error);
    }
  }

  async getBanners(req: Request, res: Response, next: NextFunction) {
    try {
      const position = req.query.position as string;
      const banners = await cmsService.getBanners(position);
      res.json({
        status: 'success',
        data: { banners },
      });
    } catch (error) {
      next(error);
    }
  }

  async getNavigation(req: Request, res: Response, next: NextFunction) {
    try {
      const location = (req.query.location as string) || 'HEADER';
      const items = await cmsService.getNavigation(location);
      res.json({
        status: 'success',
        data: { items },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin handlers
  async adminListPages(_req: Request, res: Response, next: NextFunction) {
    try {
      const pages = await cmsService.adminListPages();
      res.json({ status: 'success', data: { pages } });
    } catch (error) {
      next(error);
    }
  }

  async adminCreatePage(req: Request, res: Response, next: NextFunction) {
    try {
      const page = await cmsService.adminCreatePage(req.body);
      res.status(201).json({ status: 'success', data: { page } });
    } catch (error) {
      next(error);
    }
  }

  async adminUpdatePage(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const page = await cmsService.adminUpdatePage(id, req.body);
      res.json({ status: 'success', data: { page } });
    } catch (error) {
      next(error);
    }
  }

  async adminDeletePage(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await cmsService.adminDeletePage(id);
      res.json({ status: 'success', message: 'Page deleted' });
    } catch (error) {
      next(error);
    }
  }

  async adminListBanners(_req: Request, res: Response, next: NextFunction) {
    try {
      const banners = await cmsService.adminListBanners();
      res.json({ status: 'success', data: { banners } });
    } catch (error) {
      next(error);
    }
  }

  async adminCreateBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const banner = await cmsService.adminCreateBanner(req.body);
      res.status(201).json({ status: 'success', data: { banner } });
    } catch (error) {
      next(error);
    }
  }

  async adminUpdateBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const banner = await cmsService.adminUpdateBanner(id, req.body);
      res.json({ status: 'success', data: { banner } });
    } catch (error) {
      next(error);
    }
  }

  async adminDeleteBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await cmsService.adminDeleteBanner(id);
      res.json({ status: 'success', message: 'Banner deleted' });
    } catch (error) {
      next(error);
    }
  }
}

export const cmsController = new CmsController();
