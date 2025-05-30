/**
 * Instancias de factorías.
 * Permite usar la clase como un singleton.
 *
 * @type {Object}
 */
const instances = {};

/**
 * Clase usada como una factoría de instancias.
 * Se pueden crear distintas instancias para manejar diferentes registros.
 * Si solamente se desea un registro, se puede usar como un singleton
 * llamando al método `i()`.
 *
 * @namespace jf
 * @class     jf.Factory
 */
export default class jfFactory
{
    /**
     * Clases registradas en la factoría.
     *
     * @type {object}
     */
    #registry = {};

    /**
     * Constructor de la clase.
     */
    constructor()
    {
        /**
         * Nombre del método de inicialización a llamar cuando se pase una configuración al método `build`.
         *
         * Usando versiones antiguas de `babel` las subclases que hacen uso del plugin
         * `babel-plugin-transform-class-properties` no pueden asignar los valores recibidos
         * en el constructor ya que se asignan las propiedades usando este plugin después de
         * asignar esos valores y se pierden la asignación anterior.
         *
         * @property initMethod
         * @type     {string}
         */
        this.initMethod = '';
    }

    /**
     * Agrega al objeto los métodos de la factoría especificados con el contexto establecido a la factoría.
     *
     * @method attach
     *
     * @param {object}   obj     Objeto que recibirá los métodos.
     * @param {string[]} methods Listado de métodos a agregar.
     */
    attach(obj, methods = [ 'create', 'register' ])
    {
        if (obj)
        {
            methods.forEach(
                method =>
                {
                    if (method === 'factory')
                    {
                        Object.defineProperty(
                            obj,
                            'factory',
                            {
                                enumerable   : false,
                                configurable : false,
                                get          : function ()
                                {
                                    return this;
                                }.bind(this)
                            }
                        );
                    }
                    else if (typeof this[method] === 'function')
                    {
                        Object.defineProperty(
                            obj,
                            method,
                            {
                                enumerable   : false,
                                configurable : false,
                                writable     : false,
                                value        : this[method].bind(this)
                            }
                        );
                    }
                }
            );
        }
    }

    /**
     * Permite limpiar el registro para liberar la memoria al eliminar las referencias.
     *
     * @method clear
     *
     * @param {string} method Nombre del método que se llamará en cada clase registrada antes de eliminarse.
     *                        Si retorna `false` no se elimina del registro.
     */
    clear(method = '')
    {
        for (const _name of Object.keys(this.#registry))
        {
            this.unregister(_name, method);
        }
    }

    /**
     * Crea una instancia de una clase registrada.
     *
     * @method create
     *
     * @param {string} name   Nombre con el que se ha registrado la clase.
     * @param {*?}     config Configuración a aplicar a la nueva instancia.
     *
     * @return {object|undefined} Instancia de la clase construida o `undefined` si no existe la clase.
     */
    create(name, config)
    {
        let _instance;
        let _Class = typeof name === 'function'
            ? name
            : this.get(name);
        if (_Class && typeof _Class === 'function')
        {
            // En algunos casos usando `babel` el pasar `config` como parámetro no
            // permite asignar las propiedades. En esos casos se debe usar un método auxiliar.
            const _initMethod = this.initMethod;
            if (_initMethod)
            {
                _instance = new _Class();
                if (typeof _instance[_initMethod] === 'function')
                {
                    _instance[_initMethod](config);
                }
            }
            else
            {
                _instance = new _Class(config);
            }
        }

        return _instance;
    }

    /**
     * Devuelve la referencia de la clase que corresponde con el nombre especificado.
     *
     * @method get
     *
     * @param {string} name Nombre que hace referencia a la clase que se desea recuperar.
     */
    get(name)
    {
        return this.#registry[name];
    }

    /**
     * Registra la referencia de una clase.
     *
     * @method register
     *
     * @param {String} name  Nombre con el que registrará la clase.
     * @param {Class}  Class Referencia de la clase a registrar.
     */
    register(name, Class)
    {
        this.#registry[name || Class.name] = Class;
    }

    /**
     * Devuelve una copia del registro.
     *
     * @method register
     *
     * @return {object}
     */
    registry()
    {
        return { ...this.#registry };
    }

    /**
     * Elimina una clase del registro.
     *
     * @method unregister
     *
     * @param {String} name   Nombre con el que se registró la clase.
     * @param {String} method Nombre del método que se llamará en cada clase registrada antes de eliminarse.
     *                        Si retorna `false` no se elimina del registro.
     */
    unregister(name, method = '')
    {
        const _registry = this.#registry;
        if (name in _registry)
        {
            const _Class = _registry[name];
            if (typeof _Class[method] !== 'function' || _Class[method]() !== false)
            {
                delete _registry[name];
            }
        }
    }

    /**
     * Devuelve la instancia de la factoría usada como singleton.
     * Si no se ha creado previamente, se crea una nueva.
     *
     * @method i
     *
     * @param {String} name Nombre de la factoría a construir.
     *
     * @return {jf.Factory}
     *
     * @static
     */
    static i(name = '')
    {
        if (!(name in instances))
        {
            instances[name] = new jfFactory();
        }

        return instances[name];
    }
}
