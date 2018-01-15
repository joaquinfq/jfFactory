# jfFactory [![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

[![npm install jf-factory](https://nodei.co/npm/jf-factory.png?compact=true)](https://npmjs.org/package/jf-factory/)

Simple class factory and registry for making use of dependency injection.

## Usage

### Dependency injection

```js
class MyClass
{
    log()
    {
        console.log('MyClass');
    }
}

class Main
{
    log()
    {
        factory.create('MyClass').log();
    }
}

const factory = Factory.i(); // Or `new Factory()`;
factory.register('MyClass', MyClass);
new Main().log(); // MyClass

//-----------------------------------------------------------------------------
// Somebody need modify MyClass behavior and to replace all uses of MyClass
//-----------------------------------------------------------------------------
class MyOtherClass extends MyClass
{
    log()
    {
        console.log('MyOtherClass');
    }
}
factory.register('MyClass', MyOtherClass);
new Main().log(); // MyOtherClass
```

### Several factories

```js
//-----------------------------------------------------------------------------
// Factory for services.
//-----------------------------------------------------------------------------
const services = Factory.i('services');
service.register('api/projects', ApiProjects);

//-----------------------------------------------------------------------------
// Factory for models.
//-----------------------------------------------------------------------------
const models = Factory.i('models');
models.register('Project', Project);

//-----------------------------------------------------------------------------
// In other file.
//-----------------------------------------------------------------------------
const service = Factory.i('services').create(
    'api/projects',
    { 
        model : Factory.i('models').create('Project'),
        path  : '/api/v1/projects' 
    }
);
```
