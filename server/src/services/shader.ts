import DatabaseService from "../repository/DatabaseService";

export default class ShaderService extends DatabaseService {
  constructor() {
    super("Shaders");
  }
}