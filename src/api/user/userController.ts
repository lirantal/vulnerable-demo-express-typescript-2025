import type { Request, RequestHandler, Response } from "express";

import { userService } from "@/api/user/userService";
import type { UserSettings, NotificationType } from "@/api/user/userService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

interface UserComponentQueryString {
  name?: string;
}

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

  // 3: then we specifically type the query string as a string per the expected schema
  // which satisfies the type checker (try running `npx tsc` and check)
  // public getUserHelloComponent: RequestHandler = async (_req: Request<{},{},{}, {name?: string} >, res: Response) => {
  // 4: another option is to define an interface for the query string
  // and use it across the controller, service and repository as needed. this also casts
  // the query string input to the expected type (but of course fails to actually validate or enforce it at runtime)
  public getUserHelloComponent: RequestHandler = async (_req: Request<{}, {}, {}, UserComponentQueryString>, res: Response) => {
    const userName = _req.query.name || "World";

    console.log(_req.url);
    console.log(new URL(_req.url, "http://localhost:3000"));
    console.log(new URLSearchParams(new URL(_req.url, "http://localhost:3000").search));

    console.log(_req.query);

    if (!sanitizeXSS(userName)) {
      return res.status(400).send("Bad input detected!");
    }

    const helloComponent = `<h1>Hello, ${userName}!</h1>`;
    return res.send(helloComponent);
  }

  public getUser: RequestHandler = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id as string, 10);
    const serviceResponse = await userService.findById(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public getUserSettings: RequestHandler = async (req: Request, res: Response) => {

    // @TBD
    // if (a.isAdmin) {
    //   console.log('also is admin is true')
    // }

    // if (req.user?.isAdmin) {
    //   console.log('is admin is true!!!')
    // }

    const userSettings = await userService.getUserSettingsForUser(req.params.id);
    return handleServiceResponse(userSettings, res);


  }

  public setUserSettings: RequestHandler = async (req: Request, res: Response) => {
    const userSettings: UserSettings = req.body;
    await userService.setUserSettingsForUser(req.params.id, userSettings);
    return res.status(201).send("User settings updated successfully")
  }

  public setUserNotificationSetting: RequestHandler = async (req: Request, res: Response) => {
    const userId: string = req.params.id;
    const notificationType: NotificationType = req.body.notificationType;
    const notificationMode: string = req.body.notificationMode;
    const notificationModeValue: string | boolean = req.body.notificationModeValue;

    await userService.setUserNotificationSetting(userId, notificationType, notificationMode, notificationModeValue);
    return res.status(201).send("User notification setting updated successfully");
  }

}

function sanitizeXSS(name: string): boolean {
  const disallowList = ["<", ">", "&", '"', "'", "/", "="];

  return !disallowList.some((badInput) => name.includes(badInput));
}

export const userController = new UserController();
