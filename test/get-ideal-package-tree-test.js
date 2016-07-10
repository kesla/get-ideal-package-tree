import test from 'tapava';
import {inject as getIdealPackageTree} from '../lib';
import assert from 'assert';

const shouldNotBeCalled = () => { throw new Error('should not be called'); };
const setupGetPackage = obj => key => {
  assert(obj[key], `${key} exists in ${JSON.stringify(obj)}`);
  return Promise.resolve(obj[key]);
};

test('empty array', function * (t) {
  const actual = yield getIdealPackageTree(shouldNotBeCalled)([]);
  const expected = {};
  t.deepEqual(actual, expected);
});

test('packages w no dependencies', function * (t) {
  const getPackage = setupGetPackage(Object.freeze({
    foo: {name: 'foo', version: '1.0.0', extra: true},
    'bar@latest': {name: 'bar', version: '3.0.0', dependencies: [], extra: true},
    '@scope/bas@1.2.0': {name: '@scope/bas', version: '1.2.0', extra: true}
  }));
  const actual = yield getIdealPackageTree(getPackage)([
    'foo', '@scope/bas@1.2.0', 'bar@latest'
  ]);
  const expected = {
    '@scope/bas': {
      version: '1.2.0'
    },
    bar: {
      version: '3.0.0'
    },
    foo: {
      version: '1.0.0'
    }
  };
  t.deepEqual(actual, expected);
});

test('packages w nested dependencies that are all unique', function * (t) {
  const getPackage = setupGetPackage(Object.freeze({
    foo: {name: 'foo', version: '1.0.0', dependencies: {
      bar: '^2.0.0'
    }},
    'bar@^2.0.0': {name: 'bar', version: '2.1.2', dependencies: {
      bas: '~1.0.0'
    }},
    'bas@~1.0.0': {name: 'bas', version: '1.0.5'}
  }));
  const actual = yield getIdealPackageTree(getPackage)(['foo']);
  const expected = {
    foo: {version: '1.0.0'},
    bar: {version: '2.1.2'},
    bas: {version: '1.0.5'}
  };
  t.deepEqual(actual, expected);
});

test('multiple compatible dependencies', function * (t) {
  const getPackage = setupGetPackage(Object.freeze({
    foo: {
      name: 'foo', version: '1', dependencies: {
        bar: '^1.0.0'
      }
    },
    'bar': {name: 'bar', version: '1.2.1'},
    'bar@^1.0.0': {name: 'bar', version: '1.2.1'},
    'bar@~1.2.0': {name: 'bar', version: '1.2.1'},
    'bas': {name: 'bas', version: '1', dependencies: {
      bar: '~1.2.0'
    }}
  }));
  const actual = yield getIdealPackageTree(getPackage)(['foo', 'bar', 'bas']);
  const expected = {
    foo: {version: '1'},
    bar: {version: '1.2.1'},
    bas: {version: '1'}
  };
  t.deepEqual(actual, expected);
});

test('multiple incompatible dependencies', function * (t) {
  const getPackage = setupGetPackage(Object.freeze({
    foo: {
      name: 'foo', version: '1', dependencies: {
        bar: '^2.0.0'
      }
    },
    'bar': {name: 'bar', version: '1.2.1'},
    'bar@^2.0.0': {name: 'bar', version: '2.5.1'},
    'bar@~0.8.0': {name: 'bar', version: '0.8.5'},
    'bas': {name: 'bas', version: '1', dependencies: {
      bar: '~0.8.0'
    }}
  }));
  const actual = yield getIdealPackageTree(getPackage)(['foo', 'bar', 'bas']);
  const expected = {
    foo: {version: '1', dependencies: {bar: {version: '2.5.1'}}},
    bar: {version: '1.2.1'},
    bas: {version: '1', dependencies: {bar: {version: '0.8.5'}}}
  };
  t.deepEqual(actual, expected);
});

test('regression', function * (t) {
  const getPackage = setupGetPackage(Object.freeze({
    package1: {name: 'package1', version: '1', dependencies: {
      package2: '1',
      package3: '1'
    }},
    'package2@1': {name: 'package2', version: '1', dependencies: {
      package3: '2',
      package4: '1'
    }},
    'package3@1': {name: 'package3', version: '1'},
    'package4@1': {name: 'package4', version: '1'},
    'package2@2': {name: 'package2', version: '2'},
    'package3@2': {name: 'package3', version: '2'}
  }));
  const actual = yield getIdealPackageTree(getPackage)(['package1', 'package2@2']);
  const expected = {
    package1: {version: '1', dependencies: {
      package2: {version: '1', dependencies: {
        package3: {version: '2'}
      }}
    }},
    package2: {version: '2'},
    package3: {version: '1'},
    package4: {version: '1'}
  };
  t.deepEqual(actual, expected);
});

test('regression', function * (t) {
  const getPackage = setupGetPackage(Object.freeze({
    package1: {name: 'package1', version: '1', dependencies: {
      package2: '1',
      package3: '1'
    }},
    'package2@1': {name: 'package2', version: '1', dependencies: {
      package4: '1'
    }},
    'package2@2': {name: 'package2', version: '2'},
    'package3@1': {name: 'package3', version: '1', dependencies: {
      package4: '2'
    }},
    'package3@2': {name: 'package3', version: '2'},
    'package4@1': {name: 'package4', version: '1'},
    'package4@2': {name: 'package4', version: '2'},
    'package4@3': {name: 'package4', version: '3'}
  }));
  const actual = yield getIdealPackageTree(getPackage)([
    'package1', 'package2@2', 'package3@2', 'package4@3']);
  const expected = {
    package1: {
      version: '1',
      dependencies: {
        package2: {
          version: '1'
        },
        package3: {
          version: '1',
          dependencies: {
            package4: {
              version: '2'
            }
          }
        },
        package4: {
          version: '1'
        }
      }
    },
    package2: {
      version: '2'
    },
    package3: {
      version: '2'
    },
    package4: {
      version: '3'
    }
  };
  t.deepEqual(actual, expected);
});

test('mix compatible & incompatible', function * (t) {
  const getPackage = setupGetPackage(Object.freeze({
    foo: {name: 'foo', version: '1.0.0', dependencies: {
      bar: '^2.0.0',
      ban: '^1.0.0'
    }},
    'bar@^2.0.0': {name: 'bar', version: '2.1.2', dependencies: {
      bas: '~1.0.0',
      ban: '^1.0.0'
    }},
    'bas@~1.0.0': {name: 'bas', version: '1.0.5', dependencies: {
      ban: '^2.0.0'
    }},
    'ban@^1.0.0': {name: 'ban', version: '1.0.0'},
    'ban@^2.0.0': {name: 'ban', version: '2.0.0'}
  }));
  const actual = yield getIdealPackageTree(getPackage)(['foo']);
  const expected = {
    foo: {version: '1.0.0'},
    bar: {version: '2.1.2'},
    bas: {version: '1.0.5', dependencies: {
      ban: {version: '2.0.0'}
    }},
    ban: {version: '1.0.0'}
  };
  const expectedKeys = Object.keys(expected).sort();
  const actualKeys = Object.keys(actual);
  t.deepEqual(actual, expected);
  t.deepEqual(actualKeys, expectedKeys);
});

test('cycle', function * (t) {
  const getPackage = setupGetPackage(Object.freeze({
    foo: {name: 'foo', version: '1.0.0', dependencies: {
      bar: '2.0.0'
    }},
    'foo@1.0.0': {name: 'foo', version: '1.0.0', dependencies: {
      bar: '2.0.0'
    }},
    'bar@2.0.0': {name: 'bar', version: '2.0.0', dependencies: {
      foo: '1.0.0'
    }}
  }));
  const actual = yield getIdealPackageTree(getPackage)(['foo']);
  const expected = {
    foo: {version: '1.0.0'},
    bar: {version: '2.0.0'}
  };
  t.deepEqual(actual, expected);
});

test('handling input in alphabetic order', function * (t) {
  const getPackage = setupGetPackage({
    b: {
      name: 'b', version: '1.0.0', dependencies: {
        foo: '1.0.0'
      }
    },
    a: {
      name: 'a', version: '1.0.0', dependencies: {
        foo: '2.0.0'
      }
    },
    'foo@1.0.0': {name: 'foo', version: '1.0.0'},
    'foo@2.0.0': {name: 'foo', version: '2.0.0'}
  });
  const actual = yield getIdealPackageTree(getPackage)(['b', 'a']);
  const expected = {
    a: {version: '1.0.0'},
    b: {version: '1.0.0', dependencies: {
      foo: {version: '1.0.0'}
    }},
    foo: {version: '2.0.0'}
  };
  t.deepEqual(actual, expected);
});

test('handling input in alphabetic order', function * (t) {
  const getPackage = setupGetPackage({
    'a@1.0.0': {
      name: 'a', version: '1.0.0', dependencies: {
        foo: '2.0.0'
      }
    },
    'b@1.0.0': {
      name: 'b', version: '1.0.0', dependencies: {
        foo: '1.0.0'
      }
    },
    'foo@1.0.0': {name: 'foo', version: '1.0.0'},
    'foo@2.0.0': {name: 'foo', version: '2.0.0'},
    input: {
      name: 'input', version: '1.0.0', dependencies: {
        b: '1.0.0',
        a: '1.0.0'
      }
    }
  });
  const actual = yield getIdealPackageTree(getPackage)(['input']);
  const expected = {
    a: {version: '1.0.0'},
    b: {version: '1.0.0', dependencies: {
      foo: {version: '1.0.0'}
    }},
    foo: {version: '2.0.0'},
    input: {version: '1.0.0'}
  };
  t.deepEqual(actual, expected);
});

test('work w bundleDependencies', function * (t) {
  const getPackage = setupGetPackage({
    'a@1.0.0': {
      name: 'a', version: '1.0.0', bundleDependencies: ['bundled'], dependencies: {
        foo: '2.0.0', bundled: '3.0.0'
      }
    },
    'foo@2.0.0': {name: 'foo', version: '2.0.0'}
  });
  const actual = yield getIdealPackageTree(getPackage)(['a@1.0.0']);
  const expected = {
    a: {version: '1.0.0'},
    foo: {version: '2.0.0'}
  };
  t.deepEqual(actual, expected);
});
