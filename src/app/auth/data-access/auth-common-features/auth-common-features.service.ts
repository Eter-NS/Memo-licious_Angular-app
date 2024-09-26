import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

type SiteAction = {
  register: boolean;
  redirect?: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthCommonFeaturesService {
  checkParamMap(route: ActivatedRoute, actionParam: string): SiteAction {
    const returnObj: SiteAction = {
      register: true,
      redirect: undefined,
    };

    const pathElement = route.snapshot.paramMap.get(actionParam);
    if (!pathElement) {
      return returnObj;
    }

    const [action, parameter] = pathElement.split('=');
    switch (action) {
      case 'force':
        returnObj.register = parameter !== 'login';
        break;
      case 'forward':
        returnObj.redirect = parameter
          ? parameter.replace(/_/g, '/')
          : undefined;
        break;
    }

    return returnObj;
  }
}
