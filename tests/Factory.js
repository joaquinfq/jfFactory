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
     * @override
     */
    setUp()
    {
        this.sut = new jfFactory();
    }

    /**
     * Pruebas del método `clear` sin parámetro `method`.
     */
    testClear()
    {
        const _sut   = this.sut;
        const _names = ['Clear1', 'Clear2', 'Clear3'];
        _names.forEach(name => _sut.register(name, TestClass));
        this._assert('', Object.keys(_sut.$$registry), _names);
        _sut.clear();
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
        const _names = ['ClearWithMethod1', 'ClearWithMethod2', 'ClearWithMethod3'];
        _names.forEach(name => _sut.register(name, _Class));
        this._assert('', Object.keys(_sut.$$registry), _names);
        _sut.clear('destroy');
        this._assert('', _sut.$$registry, {});
        this._assert('', _calls, _names.length);
    }

    /**
     * Pruebas del método `constructor`.
     */
    testConstructor()
    {
        const _sut      = this.sut;
        const _expected = {
            initMethod : '',
            $$registry : {}
        };
        const _keys     = Object.keys(_expected);
        this._assert('', Object.keys(_sut), _keys);
        _keys.forEach(key => this._assert('', _sut[key], _expected[key]));
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
        this._assert('', _sut.create(), undefined);
        //------------------------------------------------------------------------------
        // Creación de una instancia a partir de una clase.
        //------------------------------------------------------------------------------
        let _instance = _sut.create(_Class);
        this._assert('ok', _instance instanceof _Class);
        this._assert('', _lastConfig, undefined);
        //------------------------------------------------------------------------------
        // Creación de una instancia a partir del nombre de una clase.
        //------------------------------------------------------------------------------
        _instance = _sut.create('Create');
        this._assert('ok', _instance instanceof TestClass);
        this._assert('', _lastConfig, undefined);
        //------------------------------------------------------------------------------
        // Creación de una instancia a partir de una clase usando una configuración.
        //------------------------------------------------------------------------------
        const _config = { a : 1 };
        _instance     = _sut.create(_Class, _config);
        this._assert('ok', _instance instanceof _Class);
        this._assert('', _lastConfig, _config);
        //------------------------------------------------------------------------------
        // Verificamos que no falle con un initMethod que no es una función.
        //------------------------------------------------------------------------------
        _lastConfig     = null;
        _sut.initMethod = 'init';
        _instance       = _sut.create(_Class);
        this._assert('ok', _instance instanceof _Class);
        this._assert('', _lastConfig, undefined);
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
        this._assert('', _sut.create(), undefined);
        //------------------------------------------------------------------------------
        // Creación de una instancia a partir de una clase.
        //------------------------------------------------------------------------------
        let _instance = _sut.create(_Class);
        this._assert('ok', _instance instanceof _Class);
        this._assert('', _initCalls, 1);
        //------------------------------------------------------------------------------
        // Creación de una instancia a partir del nombre de una clase.
        //------------------------------------------------------------------------------
        _instance = _sut.create('CreateWithInitMethod');
        this._assert('ok', _instance instanceof _Class);
        this._assert('', _initCalls, 2);
    }

    /**
     * Pruebas del método `get`.
     */
    testGet()
    {
        const _sut = this.sut;
        _sut.register('Class', TestClass);
        this._assert('', _sut.get('Class'), TestClass);
        _sut.clear();
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
        _sut.clear();
    }

    /**
     * Pruebas del método estático `i`.
     */
    testStaticI()
    {
        let _sut0 = jfFactory.i();
        this._assert('ok', _sut0 instanceof jfFactory);
        let _sut1 = jfFactory.i();
        this._assert('ok', _sut1 instanceof jfFactory);
        this._assert('ok', _sut0 === _sut1);
        _sut1 = jfFactory.i('');
        this._assert('ok', _sut1 instanceof jfFactory);
        this._assert('ok', _sut0 === _sut1);
    }

    /**
     * Pruebas del método estático `i` usando el nombre de la factoría.
     */
    testStaticIWithName()
    {
        const _name = Math.random();
        let _sut0   = jfFactory.i(_name);
        this._assert('ok', _sut0 instanceof jfFactory);
        let _sut1 = jfFactory.i(_name + 1);
        this._assert('ok', _sut1 instanceof jfFactory);
        this._assert('ok', _sut0 !== _sut1);
        this._assert('', jfFactory.i(_name), _sut0);
        this._assert('', jfFactory.i(_name + 1), _sut1);
    }

    /**
     * Pruebas del método `unregister` sin el parámetro `method`.
     */
    testUnregister()
    {
        const _sut   = this.sut;
        const _names = ['Unregister1', 'Unregister2', 'Unregister3'];
        _names.forEach(name => _sut.register(name, TestClass));
        this._assert('', Object.keys(_sut.$$registry), _names);
        for (let _i = 0; _i < _names.length; ++_i)
        {
            // Nombre inexistente
            _sut.unregister(_names[_i] + _names[_i]);
            this._assert('', Object.keys(_sut.$$registry), _names.slice(_i));
            // Nombre existente
            _sut.unregister(_names[_i]);
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
        const _names  = ['UnregisterWithMethod1', 'UnregisterWithMethod2', 'UnregisterWithMethod3'];
        const _length = _names.length;
        _names.forEach(name => _sut.register(name, _Class));
        this._assert('', Object.keys(_sut.$$registry), _names);
        //------------------------------------------------------------------------------
        // Verificación de que si el método devuelve `false` no se elimine el registro.
        //------------------------------------------------------------------------------
        for (let _i = 0; _i < _length; ++_i)
        {
            _sut.unregister(_names[_i], 'nodestroy');
            this._assert('', Object.keys(_sut.$$registry), _names);
        }
        this._assert('', _calls, _length);
        //------------------------------------------------------------------------------
        // Verificación de que si el método no devuelve `false` se elimine el registro.
        //------------------------------------------------------------------------------
        for (let _i = 0; _i < _length; ++_i)
        {
            _sut.unregister(_names[_i], 'destroy');
            this._assert('', Object.keys(_sut.$$registry), _names.slice(_i + 1));
        }
        this._assert('', _calls, _length * 2);
    }
};
