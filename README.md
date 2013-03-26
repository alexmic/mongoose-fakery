# mongoose-fakery

`mongoose-fakery` provides an easy fixture replacement method and random data generators.

## Inspiration

Parts of `mongoose-fakery` where inspired by:
* [factory-boy](https://github.com/dnerdy/factory_boy)
* [factory-lady](https://github.com/petejkim/factory-lady)
* [faker](https://github.com/marak/Faker.js/)

Thanks.

## Contributing

1. Clone the repo.
2. Create a branch.
3. Write awesome code.
4. Add tests for your changes. Test dependencies are defined in `package.json`.
5. Open a Pull Request.
6. Receive a 'Thank you!' and possibly a digital beer from me.

## License

MIT.

## TODO

1. Associations with other models. This is my first priority.
2. Browser compatibility.
3. Add more data generators.

## Documentation

### Installing

```js
npm install mongoose-fakery
```

### Creating a fakery (factory)

In your `models.js`:
```js
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: String,
    surname: String
});

mongoose.model('User', UserSchema);
```

In your tests or fixture files:
```js
var fakery = require('mongoose-fakery');

fakery.fake('user', mongoose.model('User'), {
    name: 'john',
    surname: 'doe'
});
```

### Getting a fakery

If the only argument you pass into `fake()` is the name of the factory then
the method becomes a getter.

```js
var userFakery = fakery.fake('user');
```

### Lazy attributes

'Lazy' attributes are attributes that are resolved during a 'second' pass over
the attributes of the fakery. Common usage are attributes that depend
on other attributes for their value.

To create a 'lazy' attribute use `fakery.lazy()`:
```js
fakery.fake('user', mongoose.model('User'), {
    name: 'john',
    surname: 'doe',
    email: fakery.lazy(function(attrs) {
        // this will return john@example.com
        return attrs.name + '@example.com';
    });
});
```

Each lazy attribute receives all the resolved attributes of the first pass as
the only parameter.

### Using data generators

Data generators are functions that return data. That data can be random or follow
specific patterns. `mongoose-fakery` comes with a number of pre-defined data generators
which will probably suit most of your needs i.e:

1. random strings (hex, alpha, alphanum)
2. random numbers
3. random booleans (true/false)
4. lorem generator
5. name, surname and gender
6. picking random items from lists

Pre-defined data generators are exposed under the `g` attribute of the `fakery`
object. Take a look in `data_providers.js` to see all the available generators
and their APIs.

Some examples:

```js
// using the user model defined above
fakery.fake('user', mongoose.model('User'), {
    name: fakery.g.name(),
    surname: fakery.g.surname()
});
```

Generators can also be used in arrays and nested attributes:

```js
fakery.fake('post', mongoose.model('Post'), {
    name: fakery.g.name(),
    // this will create tags 'projects', <random string>, 'tech'
    tags: ['projects', fakery.g.str(5), 'tech']
});
```

Data generators can also be used when you just want to generate a bunch of random
data for whatever purpose. They are not specific to test factories:

```js
var fakery = require('mongoose-fakery');

// generate 10 random full names
var names = [], i;
for (i = 0; i < 10; i++) {
    names.push(fakery.g.fullname());
}
```

### Creating custom data generators

`mongoose-fakery` gives you the option to create custom generators that attach
themselves to the `g` attribute to the `fakery` object:

```js
// declare like this
fakery.generator('custom', function() {
    return 'custom';
});

// use like this
var customGenerator = fakery.g.custom();
customGenerator(); // returns 'custom'
```

As you might have guessed, generators wrap 'data provider' methods in a function.
You can thus do things like:

```js
fakery.generator('timesTwo', function(n) {
    return n*2;
});

var timesTwo = fakery.g.timesTwo();
timesTwo(2); // returns 4
```

### Making a fake model

To make a fake model, use the `make()` method. `make()` can also receive overrides.

```js
var model = fakery.make('user');
var modelWithOverrides = fakery.make('user', {
    name: 'override'
});
```

Note that the model is *not* saved to the database.

### Making & saving a fake model

To make and save a fake model, use the `makeAndSave()` method.

```js
fakery.makeAndSave('user', function(err, user) {
    // `user` is saved to the database at this point
});

fakery.makeAndSave('user', {name: 'override'}, function(err, user) {
    // `user` is saved to the database and name is overriden to 'override'.
});
```