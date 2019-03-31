const jfFactory   = require('../src/Factory.js');
const jfTestsUnit = require('@jf/tests/src/type/Unit');

/**
 * Clase de prueba para registrar en la factoría.
 */
class TestClass
{
}

/**
 * Pruebas unitarias de la clase `jf.Factory`.
 */
module.exports = class jfFactoryTest extends jfTestsUnit
{
    /**
     * @override
     */
    static get title()
    {
        return 'jf.Factory';
    }

    /**
     * Registra una clase con diferentes nombres.
     *
     * @param {function} Class Referencia de la clase a registrar.
     *
     * @return {string[]} Listado de nombres con los que se registró la clase.
     */
    registerNames(Class)
    {
        const _sut   = this.sut;
        const _names = this.generateNumbers().map(String);
        _names.forEach(name => _sut.register(name, Class));
        _names.forEach(name => this.assertTrue(_sut.get(name) === Class));
        this._assert('', Object.keys(_sut.$$registry), _names);

        return _names;
    }

    /**
     * @override
     */
    setUp()
    {
        this.sut = new jfFactory();
    }

    /**
     * Pruebas del método `attach`.
     */
    testAttach()
    {
        const _obj     = {};
        const _methods = [ 'create', 'get', 'register'];
        const _self    = this;
        const _sut     = this.sut;
        const _data    = {};
        _methods.forEach(
            method => _sut[method] = function (...args)
            {
                _data[method] = args;
                // Verificamos el cambio de contexto.
                _self.assertTrue(this === _sut);
            }
        );
        // Verificamos que no pase nada sin no hay parámetros.
        _sut.attach();
        // Verificamos que no pase nada si se especifica un método que no exista.
        const _method = Date.now();
        _sut.attach(_obj, ['abc']);
        this.assertUndefined(_data[_method]);
        // Especificamos el objeto.
        _sut.attach(_obj, _methods);
        _methods.forEach(
            method =>
            {
                const _params = this.generateNumbers();
                _obj[method](..._params);
                this._assert('', _data[method], _params);
            }
        );
        // Propiedad `factory`.
        this.assertUndefined(_obj.factory);
        _sut.attach(_obj, ['factory']);
        this.assertTrue(_obj.factory === _sut);
    }

    /**
     * Pruebas del método `clear` sin parámetro `method`.
     */
    testClear()
    {
        const _sut   = this.sut;
        const _names = this.registerNames(TestClass);
        _sut.clear();
        _names.forEach(name => this.assertUndefined(_sut.get(name)));
        this._assert('', _sut.$$registry, {});
    }

    /**
     * Pruebas del método `clear` con parámetro `method`.
     */
    testClearWithMethod()
    {
        let _calls   = 0;
        const _Class = class
        {
            static destroy()
            {
                ++_calls;
            }
        };
        const _sut   = this.sut;
        const _names = this.registerNames(_Class);
        _sut.clear('destroy');
        this._assert('', _sut.$$registry, {});
        this.assertEqual(_calls, _names.length);
    }

    /**
     * Pruebas del método `create`.
     */
    testCreate()
    {
        let _lastConfig = null;
        const _Class    = class
        {
            constructor(config)
            {
                _lastConfig = config;
            }
        };
        const _sut      = this.sut;
        _sut.register('Create', TestClass);
        //------------------------------------------------------------------------------
        this.assertUndefined(_sut.create());
        //------------------------------------------------------------------------------
        // Creación de una instancia a partir de una clase.
        //------------------------------------------------------------------------------
        let _instance = _sut.create(_Class);
        this.assertTrue(_instance instanceof _Class);
        this.assertUndefined(_lastConfig);
        //------------------------------------------------------------------------------
        // Creación de una instancia a partir del nombre de una clase.
        //------------------------------------------------------------------------------
        _instance = _sut.create('Create');
        this.assertTrue(_instance instanceof TestClass);
        this.assertUndefined(_lastConfig);
        //------------------------------------------------------------------------------
        // Creación de una instancia a partir de una clase usando una configuración.
        //------------------------------------------------------------------------------
        const _config = { a : 1 };
        _instance     = _sut.create(_Class, _config);
        this.assertTrue(_instance instanceof _Class);
        this._assert('', _lastConfig, _config);
        //------------------------------------------------------------------------------
        // Verificamos que no falle con un initMethod que no es una función.
        //------------------------------------------------------------------------------
        _lastConfig     = null;
        _sut.initMethod = 'init';
        _instance       = _sut.create(_Class);
        this.assertTrue(_instance instanceof _Class);
        this.assertUndefined(_lastConfig);
    }

    /**
     * Pruebas del método `create` usando la propiedad `initMethod`.
     */
    testCreateWithInitMethod()
    {
        let _initCalls  = 0;
        const _Class    = class
        {
            init()
            {
                ++_initCalls;
            }
        };
        const _sut      = this.sut;
        _sut.initMethod = 'init';
        _sut.register('CreateWithInitMethod', _Class);
        //------------------------------------------------------------------------------
        this.assertUndefined(_sut.create());
        //------------------------------------------------------------------------------
        // Creación de una instancia a partir de una clase.
        //------------------------------------------------------------------------------
        let _instance = _sut.create(_Class);
        this.assertTrue(_instance instanceof _Class);
        this.assertEqual(_initCalls, 1);
        //------------------------------------------------------------------------------
        // Creación de una instancia a partir del nombre de una clase.
        //------------------------------------------------------------------------------
        _instance = _sut.create('CreateWithInitMethod');
        this.assertTrue(_instance instanceof _Class);
        this.assertEqual(_initCalls, 2);
    }

    /**
     * Comprueba la definición de la clase.
     */
    testDefinition()
    {
        this._testDefinition(
            jfFactory,
            null,
            {
                initMethod : '',
                $$registry : {}
            }
        );
    }

    /**
     * Pruebas del método `get`.
     */
    testGet()
    {
        this.registerNames(TestClass);
    }

    /**
     * Pruebas del método `register`.
     */
    testRegister()
    {
        const _sut = this.sut;
        _sut.register('Class', TestClass);
        this._assert('', _sut.get('Class'), TestClass);
        _sut.register('', TestClass);
        this._assert('', _sut.get('TestClass'), TestClass);
        _sut.register('TestClass', String);
        this._assert('', _sut.get('TestClass'), String);
    }

    /**
     * Pruebas del método estático `i`.
     */
    testStaticI()
    {
        let _sut0 = jfFactory.i();
        this.assertTrue(_sut0 instanceof jfFactory);
        let _sut1 = jfFactory.i();
        this.assertTrue(_sut1 instanceof jfFactory);
        this.assertTrue(_sut0 === _sut1);
        _sut1 = jfFactory.i('');
        this.assertTrue(_sut1 instanceof jfFactory);
        this.assertTrue(_sut0 === _sut1);
    }

    /**
     * Pruebas del método estático `i` usando el nombre de la factoría.
     */
    testStaticIWithName()
    {
        const _name = Math.random();
        let _sut0   = jfFactory.i(_name);
        this.assertTrue(_sut0 instanceof jfFactory);
        let _sut1 = jfFactory.i(_name + 1);
        this.assertTrue(_sut1 instanceof jfFactory);
        this.assertTrue(_sut0 !== _sut1);
        this._assert('', jfFactory.i(_name), _sut0);
        this._assert('', jfFactory.i(_name + 1), _sut1);
    }

    /**
     * Pruebas del método `unregister` sin el parámetro `method`.
     */
    testUnregister()
    {
        const _sut   = this.sut;
        const _names = this.registerNames(TestClass);
        for (let _i = 0; _i < _names.length; ++_i)
        {
            const _name = _names[_i];
            // Nombre inexistente
            _sut.unregister(_name + _name);
            this._assert('', Object.keys(_sut.$$registry), _names.slice(_i));
            // Nombre existente
            _sut.unregister(_name);
            this._assert('', Object.keys(_sut.$$registry), _names.slice(_i + 1));
        }
    }

    /**
     * Pruebas del método `unregister` con el parámetro `method`.
     */
    testUnregisterWithMethod()
    {
        let _calls    = 0;
        const _Class  = class
        {
            static destroy()
            {
                ++_calls;
            }

            static nodestroy()
            {
                this.destroy();
                return false;
            }
        };
        const _sut    = this.sut;
        const _names  = this.registerNames(_Class);
        const _length = _names.length;
        //------------------------------------------------------------------------------
        // Verificación de que si el método devuelve `false` no se elimine el registro.
        //------------------------------------------------------------------------------
        for (let _i = 0; _i < _length; ++_i)
        {
            _sut.unregister(_names[_i], 'nodestroy');
            this._assert('', Object.keys(_sut.$$registry), _names);
        }
        this.assertEqual(_calls, _length);
        //------------------------------------------------------------------------------
        // Verificación de que si el método no devuelve `false` se elimine el registro.
        //------------------------------------------------------------------------------
        for (let _i = 0; _i < _length; ++_i)
        {
            _sut.unregister(_names[_i], 'destroy');
            this._assert('', Object.keys(_sut.$$registry), _names.slice(_i + 1));
        }
        this.assertEqual(_calls, _length * 2);
    }
};
