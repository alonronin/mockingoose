# TypeDoc Configuration Reference

## Configuration Options

### Basic Configuration
```json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/api",
  "theme": "default",
  "name": "My Project",
  "includeVersion": true
}
```

### Advanced Configuration
```json
{
  "entryPoints": ["src/index.ts", "src/cli.ts"],
  "entryPointStrategy": "resolve",
  "out": "docs/api",
  "theme": "markdown",
  "readme": "API.md",
  "name": "My TypeScript Project",
  "includeVersion": true,
  "excludePrivate": true,
  "excludeProtected": false,
  "excludeExternals": true,
  "excludeNotDocumented": false,
  "disableSources": false,
  "disableGit": false,
  "hideGenerator": false,
  "sort": ["source-order"],
  "kindSortOrder": [
    "Document",
    "Project",
    "Module",
    "Namespace",
    "Enum",
    "EnumMember",
    "Class",
    "Interface",
    "TypeAlias",
    "Constructor",
    "Property",
    "Variable",
    "Function",
    "Accessor",
    "Method",
    "Parameter",
    "TypeParameter",
    "TypeLiteral",
    "CallSignature",
    "ConstructorSignature",
    "IndexSignature",
    "GetSignature",
    "SetSignature"
  ],
  "categorizeByGroup": true,
  "categoryOrder": [
    "Authentication",
    "Authorization",
    "Core",
    "Utilities",
    "*",
    "Other"
  ],
  "defaultCategory": "Other",
  "basePath": ".",
  "gitRevision": "main",
  "gitRemote": "origin",
  "navigation": {
    "includeCategories": true,
    "includeGroups": true
  },
  "searchInComments": true,
  "searchInDocuments": true,
  "cleanOutputDir": true,
  "titleLink": "https://myproject.com",
  "navigationLinks": {
    "GitHub": "https://github.com/user/repo",
    "Docs": "https://docs.myproject.com"
  },
  "sidebarLinks": {
    "API Reference": "modules.html",
    "Examples": "examples.html"
  },
  "plugin": ["typedoc-plugin-markdown"],
  "markdownOptions": {
    "hideBreadcrumbs": false,
    "hideInPageTOC": false,
    "indexFormat": "table",
    "entryDocument": "index.md",
    "namedAnchors": true,
    "preserveAnchorCasing": true
  }
}
```

## Theme Options

### Default Theme
```json
{
  "theme": "default",
  "customCss": "./assets/custom.css",
  "highlightTheme": "light-plus"
}
```

### Markdown Theme
```json
{
  "theme": "markdown",
  "markdownOptions": {
    "indexFormat": "table",
    "entryDocument": "index.md",
    "hideBreadcrumbs": false,
    "namedAnchors": true
  }
}
```

### Minimal Theme
```json
{
  "theme": "minimal",
  "minimalOptions": {
    "hideMembersSymbol": false,
    "navigationLeaves": ["modules"]
  }
}
```

## Comment Tags

### Basic Tags
```typescript
/**
 * @module MyModule
 * @packageDocumentation
 * @preferred
 * @documentable
 * @hidden
 * @ignore
 * @internal
 * @private
 * @protected
 * @public
 * @readonly
 * @static
 */
```

### Documentation Tags
```typescript
/**
 * @param name - Parameter description
 * @param name.description - Detailed parameter description
 * @param name.example - Parameter example
 * @returns Return value description
 * @returns.description - Detailed return description
 * @throws Error description
 * @throws.description - Detailed error description
 * @example Code example
 * @example.description - Example description
 * @example.code - Code block
 * @see Related reference
 * @see {@link MyClass} - Linked reference
 * @inheritDoc
 * @override
 * @virtual
 */
```

### Type-Specific Tags
```typescript
/**
 * @augments ParentClass
 * @extends ParentClass
 * @implements Interface
 * @interface
 * @enum
 * @namespace
 * @constructor
 * @class
 * @abstract
 * @member
 * @method
 * @function
 * @callback
 * @event
 * @fires
 * @listens
 * @mixes MixinName
 * @mixin
 */
```

### Advanced Tags
```typescript
/**
 * @typeParam T - Generic type parameter
 * @typeparam T - Alias for @typeParam
 * @template T - Another alias for @typeParam
 * @default defaultValue
 * @defaultValue defaultValue
 * @deprecated Since version X.Y.Z
 * @since Version when added
 * @version Current version
 * @author Author name
 * @category Category name
 * @group Group name
 * @summary Short summary
 * @description Long description
 * @remarks Additional remarks
 * @comment Additional comments
 * @todo Todo item
 * @fixme Fixme item
 * @bug Bug reference
 * @issue Issue reference
 * @link https://example.com
 * @tutorial Tutorial reference
 * @guide Guide reference
 * @doc Documentation reference
 * @api API reference
 * @publicApi Public API marker
 * @beta Beta status
 * @alpha Alpha status
 * @experimental Experimental status
 * @stable Stable status
 * @readonlyDoc Readonly documentation
 * @internalDoc Internal documentation
 */
```

## Integration with Build Tools

### Webpack Plugin
```javascript
// webpack.config.js
const TypeDocWebpackPlugin = require('typedoc-webpack-plugin');

module.exports = {
  plugins: [
    new TypeDocWebpackPlugin({
      name: 'My Project',
      mode: 'file',
      out: './docs',
      theme: 'default',
      includeDeclarations: false,
      ignoreCompilerErrors: true,
      version: true
    })
  ]
};
```

### Rollup Plugin
```javascript
// rollup.config.js
import typedoc from 'rollup-plugin-typedoc';

export default {
  plugins: [
    typedoc({
      out: './docs',
      exclude: '**/*.{test,spec}.ts',
      theme: 'markdown',
      readme: 'API.md'
    })
  ]
};
```

### Vite Plugin
```javascript
// vite.config.js
import typedoc from 'vite-plugin-typedoc';

export default {
  plugins: [
    typedoc({
      entryPoints: ['src/index.ts'],
      out: 'docs/api',
      theme: 'default'
    })
  ]
};
```

## TypeDoc Plugins

### Plugin Development
```typescript
// typedoc-plugin-example.ts
import { Application, Converter, Context, Reflection } from 'typedoc';

export function load(app: Application) {
  app.converter.on(Converter.EVENT_CREATE_SIGNATURE,
    (context: Context, reflection: Reflection, node?) => {
      // Plugin logic
      if (reflection.kind === ReflectionKind.Method) {
        reflection.comment = reflection.comment || new Comment();
        reflection.comment.tags.push(new Tag('@custom', 'Custom tag'));
      }
    }
  );
}
```

### Popular Plugins
- `typedoc-plugin-markdown` - Markdown output
- `typedoc-plugin-external-module-name` - Module naming
- `typedoc-plugin-sourcefile-url` - Source links
- `typedoc-plugin-lerna-packages` - Monorepo support
- `typedoc-plugin-not-exported` - Non-exported members
- `typedoc-plugin-internal-external` - Internal/external
- `typedoc-plugin-rename-defaults` - Rename defaults
- `typedoc-plugin-pages` - Custom pages
- `typedoc-plugin-versions` - Version selector
- `typedoc-plugin-mermaid` - Mermaid diagrams

## Best Practices

### 1. Entry Point Strategy
```typescript
// Use barrel exports in index.ts
export * from './user';
export * from './auth';
export * from './utils';

// Re-export types for better documentation
export type { User, CreateUserDto } from './user/types';
```

### 2. Module Documentation
```typescript
/**
 * @packageDocumentation
 *
 * This module provides authentication and authorization functionality
 * for the application.
 *
 * @remarks
 * Implements JWT-based authentication with refresh tokens.
 *
 * @example
 * ```typescript
 * import { AuthModule } from '@myapp/auth';
 *
 * const auth = new AuthModule(config);
 * ```
 */

export { AuthService } from './auth.service';
export { JwtStrategy } from './jwt.strategy';
```

### 3. Type Documentation
```typescript
/**
 * Represents a user in the system
 * @interface User
 *
 * @category Models
 * @subcategory User Management
 */
export interface User {
  /** Unique identifier */
  id: string;

  /** Email address - must be unique */
  email: string;

  /** User roles for RBAC */
  roles: UserRole[];
}
```

### 4. Linking
```typescript
/**
 * @see {@link UserService} for user operations
 * @see {@link UserRole} for available roles
 * @see https://docs.example.com/users for more info
 * @see [User Guide](../guides/user-management.md)
 */
export interface User {
  // ...
}
```

## Troubleshooting

### Common Issues

1. **Missing exports**
```json
{
  "entryPoints": ["src/index.ts"],
  "excludeNotDocumented": false
}
```

2. **TypeScript errors**
```json
{
  "ignoreCompilerErrors": true,
  "skipLibCheck": true
}
```

3. **Slow generation**
```json
{
  "exclude": ["**/*.test.ts", "**/*.spec.ts", "node_modules"],
  "disableSources": true
}
```

4. **Large output**
```json
{
  "excludePrivate": true,
  "excludeProtected": true,
  "excludeExternals": true
}
```

### Performance Optimization
```json
{
  "cleanOutputDir": false,
  "gitRevision": false,
  "disableSources": true,
  "plugin": ["typedoc-plugin-skip-code"]
}
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Generate Documentation

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'package.json'
      - 'tsconfig.json'

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Generate documentation
        run: |
          npx typedoc

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

### GitLab CI
```yaml
generate_docs:
  stage: documentation
  image: node:18
  script:
    - npm ci
    - npx typedoc
  artifacts:
    paths:
      - docs/
    expire_in: 1 week
  only:
    - main
```

## Validation and Testing

### Documentation Coverage
```typescript
// scripts/check-doc-coverage.ts
import { Application } from 'typedoc';

async function checkCoverage() {
  const app = new Application();

  app.bootstrap({
    entryPoints: ['src/index.ts'],
    tsconfig: 'tsconfig.json'
  });

  const project = app.convert();

  if (!project) {
    throw new Error('Failed to convert project');
  }

  const reflections = project.getReflections();
  const undocumented = reflections.filter(
    r => !r.comment && r.kindOf(ReflectionKind.All)
  );

  console.log(`Documentation coverage: ${
    ((reflections.length - undocumented.length) / reflections.length * 100).toFixed(2)
  }%`);

  if (undocumented.length > 0) {
    console.log('Undocumented items:');
    undocumented.forEach(item => {
      console.log(`- ${item.name} (${ReflectionKind[item.kind]})`);
    });
  }
}

checkCoverage();
```

### Documentation Testing
```typescript
// tests/documentation.test.ts
describe('Documentation', () => {
  it('should have JSDoc for all public methods', () => {
    const publicMethods = getPublicMethods('./src');
    const documentedMethods = getDocumentedMethods('./src');

    publicMethods.forEach(method => {
      expect(documentedMethods).toContain(method);
    });
  });

  it('should have valid TypeDoc comments', async () => {
    const result = await validateTypeDoc('./src');
    expect(result.errors).toHaveLength(0);
  });
});
```

## Migration Guide

### From JSDoc to TypeDoc
1. Install TypeDoc: `npm install --save-dev typedoc`
2. Create configuration file
3. Update comment syntax if needed
4. Add @category and @group tags
5. Generate and review output
6. Fix any warnings or errors

### From Compodoc (Angular)
```bash
# Install TypeDoc
npm install --save-dev typedoc

# Update package.json scripts
"docs:generate": "typedoc --angularCompilerOptions tsconfig.json"
```

### From Documentation.js
```bash
# Install TypeDoc
npm install --save-dev typedoc

# Convert configuration
# Documentation.js: .documentation.js
# TypeDoc: typedoc.json
```

## Advanced Features

### Custom Themes
```typescript
// custom-theme.ts
import { DefaultTheme } from 'typedoc';

export class CustomTheme extends DefaultTheme {
  constructor(renderer: Renderer) {
    super(renderer);
  }

  getUrls(project: ProjectReflection): UrlMapping[] {
    const urls = super.getUrls(project);
    // Custom URL logic
    return urls;
  }
}
```

### Custom Renderers
```typescript
// custom-renderer.ts
import { Renderer } from 'typedoc';

export class CustomRenderer extends Renderer {
  constructor() {
    super();
    this.theme = new CustomTheme(this);
  }
}
```

### Event Handling
```typescript
// typedoc-events.ts
import { Application } from 'typedoc';

const app = new Application();

app.converter.on(Converter.EVENT_BEGIN, () => {
  console.log('Conversion started');
});

app.converter.on(Converter.EVENT_END, () => {
  console.log('Conversion completed');
});

app.renderer.on(Renderer.EVENT_BEGIN, () => {
  console.log('Rendering started');
});
```

## Output Examples

### Module Documentation
```markdown
# Module: user/UserService

## Table of contents

### Classes

- [UserService](user_UserService.UserService.md)

### Interfaces

- [User](user_UserService.User.md)
- [CreateUserDto](user_UserService.CreateUserDto.md)

### Type aliases

- [UserRole](user_UserService.md#userrole)

### Functions

- [validateUser](user_UserService.md#validateuser)
```

### Class Documentation
```markdown
# Class: UserService

Service for managing user operations

## Hierarchy

- `BaseService`

  ↳ `UserService`

## Implements

- `IUserService`

## Constructors

### constructor

\+ new UserService(`config`: [UserServiceConfig](user_UserService.UserServiceConfig.md)): [UserService](user_UserService.UserService.md)

Creates a new instance of UserService

#### Parameters:

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [UserServiceConfig](user_UserService.UserServiceConfig.md) | Service configuration |

## Methods

### createUser

▸ createUser(`data`: [CreateUserDto](user_UserService.CreateUserDto.md)): Promise<[User](user_UserService.User.md)\u003e

Creates a new user

#### Parameters:

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [CreateUserDto](user_UserService.CreateUserDto.md) | User creation data |

#### Returns:

Promise<[User](user_UserService.User.md)\u003e

Created user

#### Throws:

- `ValidationError` if data is invalid
- `DuplicateError` if user already exists
```