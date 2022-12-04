import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Project from "App/Models/Project";
import User from "App/Models/User";
import ProjectValidator from "App/Validators/ProjectValidator";
import ProjectValidatorUpdateValidator from "App/Validators/ProjectValidatorUpdateValidator";
import axios from "axios";
import Env from '@ioc:Adonis/Core/Env';

export default class ProjectsController {

  public async store({ request, response }: HttpContextContract) {
    //pegar username do header
    const username = request.header("username");
    if (username == null) {
      return response.preconditionFailed({
        message: "não foi informado um username válido no header",
      });
    }
    //buscar usuario com o header buscado
    const user = await User.findBy("username", username);
    if (user == null) {
      return response.notFound({
        message: "User informado no header não foi encontrado",
      });
    }
    //validar o corpo da requisição
    const body = await request.validate(ProjectValidator);
    body["userId"] = user!.id;
    //criar o project
    const project = await Project.create(body);
    return response.created({
      id: project.id,
      title: project.title,
      zip_code: project.zip_code,
      cost: project.cost,
      done: project.done ?? false,
      deadline: project.deadline,
      username: username,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
    });
  }

  public async index({ request, response }: HttpContextContract) {

    const username = request.header("username");
    if (username != null) {
      const user = await User.findBy("username", username);
      if (user == null) {
        return response.notFound({
          message: "User informado no header não foi encontrado",
        });
      }

      const projects = await Database.rawQuery(
        `select p.id, p.title, p.zip_code, p.cost, p.done, p.deadline, 
        u.username, p.created_at, p.updated_at
        from projects p, users u
        where p.user_id = u.id and u.id = ?`,
        [user!.id]
      );

      return projects.rows;
    }

    const projects = await Database.rawQuery(
      `select  p.id, p.title, p.zip_code, p.cost, p.done, p.deadline, u.username, 
      p.created_at, p.updated_at
      from projects p, users u
      where p.user_id = u.id`
    );

    return projects.rows;
  }

  public async show({ request }: HttpContextContract) {
    const projectId = request.param("id");
    const rawProject = await Project.findOrFail(projectId);
    await rawProject.load("user");

    const search = await axios.get(
      Env.get('CEP_API') + rawProject.zip_code + "/json/"
    );

    const project = {
      id: rawProject.id,
      title: rawProject.title,
      localization: {},
      zip_code: rawProject.zip_code,
      cost: rawProject.cost,
      done: rawProject.done,
      deadline: rawProject.deadline,
      username: rawProject.user.username,
      created_at: rawProject.createdAt,
      updated_at: rawProject.updatedAt,
    };
    
    if (search.status != 200) {
      project.localization = {
        erro: 'Localização não encontrada por problemas ao se conectar com a api do viacep'
      }

      return project;
    }

    if(search.status == 200 && search.data.erro == true){
      project.localization = {
        erro: `A localização não pode ser mostrada pois o zip_code 'cep', não existe entre os ceps brasileiros`,
      }
      return project;
    }

    project.localization = search.data;

    return project
  }

  public async destroy({ request, response }: HttpContextContract) {
    const projectId = request.param("id");
    const username = request.header("username");

    if (!username) {
      return response.preconditionFailed({
        message: "não foi informado um username válido no header",
      });
    }
    const user = await User.findBy("username", username);
    if (!user) {
      return response.notFound({
        message: "User informado no header não foi encontrado",
      });
    }
    const project = await Project.find(projectId);
    if (!project || project.userId != user.id) {
      return response.notFound({
        message: "Project com esse id não foi encontrado",
      });
    }
    await project.delete();
    return response.noContent();
  }

  public async update({ response, request }: HttpContextContract) {
    const projectId = request.param("id");
    const username = request.header("username");
    if (username == null) {
      return response.preconditionFailed({
        message: "não foi informado um username válido no header",
      });
    }
    const user = await User.findBy("username", username);
    if (user == null) {
      return response.notFound({
        message: "User informado no header não foi encontrado",
      });
    }
    const project = await Project.find(projectId);
    if (project == null || project.userId != user.id) {
      return response.notFound({
        message: "Project com esse id não foi encontrado",
      });
    }
    const body = await request.validate(ProjectValidatorUpdateValidator);
    await project.merge(body).save();
    return {
      id: project.id,
      title: project.title,
      zip_code: project.zip_code,
      cost: project.cost,
      done: project.done,
      deadline: project.deadline,
      username: username,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
    };
  }

  public async updateDone({ response, request }: HttpContextContract) {
    const projectId = request.param("id");
    const username = request.header("username");
    if (username == null) {
      return response.preconditionFailed({
        message: "não foi informado um username válido no header",
      });
    }
    const user = await User.findBy("username", username);
    if (user == null) {
      return response.notFound({
        message: "User informado no header não foi encontrado",
      });
    }
    const project = await Project.find(projectId);
    if (project == null || project.userId != user.id) {
      return response.notFound({
        message: "Project com esse id não foi encontrado",
      });
    }
    await project.merge({ done: true }).save();
    return {
      id: project.id,
      title: project.title,
      zip_code: project.zip_code,
      cost: project.cost,
      done: project.done,
      deadline: project.deadline,
      username: username,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
    };
  }
}
