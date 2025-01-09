import type { Request, RequestHandler, Response } from "express";

import { userService } from "@/api/user/userService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class UserController {
  public getUsers: RequestHandler = async (_req: Request, res: Response) => {
    // 1: try this first, declaring filterQuery as 'any'
    // const filterQuery: any = _req.query.filter || '';

    // 2: then, we improve to this variation which declares the query filter
    // as a string which is what we expect
    const filterQuery: string = _req.query.filter as string || '';

    console.log(`req.query.filter: ${filterQuery}; typeof: ${typeof filterQuery}`);

    const serviceResponse = await userService.findAll({ filter: filterQuery });
    return handleServiceResponse(serviceResponse, res);
  };

  public getUser: RequestHandler = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id as string, 10);
    const serviceResponse = await userService.findById(id);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const userController = new UserController();
