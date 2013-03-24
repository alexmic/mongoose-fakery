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
6. Receive a 'Thanks!' and possibly a digital beer from me.

## License

MIT.

## TODO

1. Associations with other models. This is my first priority.
2. Browser compatibility.

## Documentation

### Creating a fakery (factory)

```js
// in your models.js
var UserSchema = new Schema({
    name: String,
    surname: String
});
mongoose.model('User', UserSchema);

// in your tests or fixture files
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

### Using data generators

### Creating custom data generators

### Making a fake model

### Making & saving a fake model