import { Router } from 'express';

import { authAccessController } from '../controllers';

const router = Router();

router.get("/login", authAccessController)


module.exports(router)