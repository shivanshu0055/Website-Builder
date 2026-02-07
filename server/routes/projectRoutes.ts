import express from "express";
import { protect } from "../middlerwares/auth.js";
import { deleteProject, getProjectCodeById, getProjectPreview, getPublishedProjects, makeRevision, rollback, saveProjectCode } from "../controllers/projectController.js";

const projectRouter=express.Router()

projectRouter.post('/revision/:projectId',protect,makeRevision)
projectRouter.put('/save/:projectId',protect,saveProjectCode)
projectRouter.get('/rollback/:projectId/:versionId',protect,rollback)
projectRouter.delete('/:projectId',protect,deleteProject)
projectRouter.get('/preview/:projectId',protect,getProjectPreview)
projectRouter.get('/published',getPublishedProjects)
projectRouter.get('/published/:projectId',getProjectCodeById)

export default projectRouter
