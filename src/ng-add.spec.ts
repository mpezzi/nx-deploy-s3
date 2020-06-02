import { SchematicContext, Tree } from '@angular-devkit/schematics';

import { ngAdd } from './ng-add';

const PROJECT_NAME = 'pie-ka-chu';
const PROJECT_ROOT = 'pirojok';

const OTHER_PROJECT_NAME = 'pi-catch-you';

describe('ng-add', () => {
  describe('generating files', () => {
    let tree: Tree;

    beforeEach(() => {
      tree = Tree.empty();
      tree.create('workspace.json', JSON.stringify(generateAngularJson()));
    });

    it('generates new files if starting from scratch', async () => {
      const result = ngAdd({
        project: PROJECT_NAME
      })(tree, {} as SchematicContext);

      expect(result.read('workspace.json')!.toString()).toEqual(
        initialAngularJson
      );
    });

    it('overrides existing files', async () => {
      const tempTree = ngAdd({
        project: PROJECT_NAME
      })(tree, {} as SchematicContext);

      const result = ngAdd({
        project: OTHER_PROJECT_NAME
      })(tempTree, {} as SchematicContext);

      const actual = result.read('workspace.json')!.toString();

      expect(actual).toEqual(overwriteAngularJson);
    });
  });

  describe('error handling', () => {
    it('fails if project not defined', () => {
      const tree = Tree.empty();
      const angularJSON = generateAngularJson();
      delete angularJSON.defaultProject;
      tree.create('workspace.json', JSON.stringify(angularJSON));

      expect(() =>
        ngAdd({
          project: ''
        })(tree, {} as SchematicContext)
      ).toThrowError(
        'No Angular project selected and no default project in the workspace'
      );
    });

    it('Should throw if workspace.json not found', async () => {
      expect(() =>
        ngAdd({
          project: PROJECT_NAME
        })(Tree.empty(), {} as SchematicContext)
      ).toThrowError('Could not find workspace.json');
    });

    it('Should throw if workspace.json can not be parsed', async () => {
      const tree = Tree.empty();
      tree.create('workspace.json', 'hi');

      expect(() =>
        ngAdd({
          project: PROJECT_NAME
        })(tree, {} as SchematicContext)
      ).toThrowError('Could not parse workspace.json');
    });

    it('Should throw if specified project does not exist ', async () => {
      const tree = Tree.empty();
      tree.create('workspace.json', JSON.stringify({ projects: {} }));

      expect(() =>
        ngAdd({
          project: PROJECT_NAME
        })(tree, {} as SchematicContext)
      ).toThrowError(
        'The specified Angular project is not defined in this workspace'
      );
    });

    it('Should throw if specified project is not application', async () => {
      const tree = Tree.empty();
      tree.create(
        'workspace.json',
        JSON.stringify({
          projects: { [PROJECT_NAME]: { projectType: 'pokemon' } }
        })
      );

      expect(() =>
        ngAdd({
          project: PROJECT_NAME
        })(tree, {} as SchematicContext)
      ).toThrowError(
        'Deploy requires an Angular project type of "application" in workspace.json'
      );
    });

    it('Should throw if app does not have architect configured', async () => {
      const tree = Tree.empty();
      tree.create(
        'workspace.json',
        JSON.stringify({
          projects: { [PROJECT_NAME]: { projectType: 'application' } }
        })
      );

      expect(() =>
        ngAdd({
          project: PROJECT_NAME
        })(tree, {} as SchematicContext)
      ).toThrowError(
        'Cannot read the output path (architect.build.options.outputPath) of the Angular project "pie-ka-chu" in workspace.json'
      );
    });
  });
});

function generateAngularJson() {
  return {
    defaultProject: PROJECT_NAME,
    projects: {
      [PROJECT_NAME]: {
        projectType: 'application',
        root: PROJECT_ROOT,
        architect: {
          build: {
            options: {
              outputPath: 'dist/ikachu'
            }
          }
        }
      },
      [OTHER_PROJECT_NAME]: {
        projectType: 'application',
        root: PROJECT_ROOT,
        architect: {
          build: {
            options: {
              outputPath: 'dist/ikachu'
            }
          }
        }
      }
    }
  };
}

const initialAngularJson = `{
  "defaultProject": "pie-ka-chu",
  "projects": {
    "pie-ka-chu": {
      "projectType": "application",
      "root": "pirojok",
      "architect": {
        "build": {
          "options": {
            "outputPath": "dist/ikachu"
          }
        },
        "deploy": {
          "builder": "nx-deploy-s3:deploy",
          "options": {}
        }
      }
    },
    "pi-catch-you": {
      "projectType": "application",
      "root": "pirojok",
      "architect": {
        "build": {
          "options": {
            "outputPath": "dist/ikachu"
          }
        }
      }
    }
  }
}`;

const overwriteAngularJson = `{
  "defaultProject": "pie-ka-chu",
  "projects": {
    "pie-ka-chu": {
      "projectType": "application",
      "root": "pirojok",
      "architect": {
        "build": {
          "options": {
            "outputPath": "dist/ikachu"
          }
        },
        "deploy": {
          "builder": "nx-deploy-s3:deploy",
          "options": {}
        }
      }
    },
    "pi-catch-you": {
      "projectType": "application",
      "root": "pirojok",
      "architect": {
        "build": {
          "options": {
            "outputPath": "dist/ikachu"
          }
        },
        "deploy": {
          "builder": "nx-deploy-s3:deploy",
          "options": {}
        }
      }
    }
  }
}`;
