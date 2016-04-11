var squel = require('squel');

squel.useFlavour('postgres');

function parse_query_key(key, value, previous_key) {
	switch (key) {
		/* array operators */
		case '$all':
			throw new Error('Unsupported');
			break;

		case '$elemMatch':
			throw new Error('Unsupported');
			break;

		case '$size':
			throw new Error('Unsupported');
			break;

		/* comparison operators */
		case '$gt':
			return '(' + previous_key + ' > ' + value + ')';
			break;

		case '$gte':
			return '(' + previous_key + ' >= ' + value + ')';
			break;

		case '$lt':
			return '(' + previous_key + ' < ' + value + ')';
			break;

		case '$lte':
			return '(' + previous_key + ' <= ' + value + ')';
			break;

		case '$ne':
			return '(' + previous_key + ' <> ' + value + ')';
			break;

		case '$nin':
			if (typeof value !== 'object' || !Array.isArray(value)) {
				throw new Error('Invalid value');
			}

			return '(' + previous_key + ' NOT IN (' + value.join(',') + '))';
			break;

		case '$in':
			if (typeof value !== 'object' || !Array.isArray(value)) {
				throw new Error('Invalid value');
			}
			
			return '(' + previous_key + ' IN (' + value.join(',') + '))';
			break;

		/* element operators */
		case '$exists':
			if (typeof value !== 'boolean') {
				throw new Error('Invalid value');
			}

			if (value) {
				return '(' + previous_key + ' is not null)';
			}

			else {
				return '(' + previous_key + ' is null)';
			}

			break;

		case '$type':
			throw new Error('Unsupported');
			break;

		/* evaluation operators */
		case '$regex':
			throw new Error('Unsupported');
			break;

		case '$mod':
			throw new Error('Unsupported');
			break;

		case '$where':
			throw new Error('Unsupported');
			break;

		/* logical operators */
		case '$and':
			throw new Error('Unsupported');
			break;

		case '$or':
			if (typeof value !== 'object' || !Array.isArray(value)) {
				throw new Error('Invalid value');
			}

			var clause = '(';

			value.forEach(function (v, index) {
				if (typeof v !== 'object') {
					throw new Error('Invalid value');
				}

				Object.keys(v).forEach(function (k) {
					clause += parse_query_key(k, v[k], previous_key);
				});

				if (index !== value.length - 1) {
					clause += ' OR ';
				}
			});

			clause += ')';

			return clause;

			break;

		case '$nor':
			throw new Error('Unsupported');
			break;

		case '$not':
			throw new Error('Unsupported');
			break;

		default: {
			if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
				return '(' + key + ' = ' + value + ')';
			}

			else if (typeof value === 'object') {
				if (value === null) {
					return '(' + key + ' IS NULL)';
				}

				else if (Array.isArray(value)) {
					return '(' + key + ' = ' + JSON.stringify(value) + ')';
				}

				else {
					var clause = '(';

					var keys = Object.keys(value);

					keys.forEach(function (obj_key, index) {
						clause += parse_query_key(obj_key, value[obj_key], key);

						if (index !== keys.length - 1) {
							clause += ' AND ';
						}
					});

					clause += ')';

					return clause;
				}
			}
		}
	}
}

function find(collection, query, fields) {
	var sql = squel.select();

	sql.from(collection);

	Object.keys(fields).forEach(function (key) {
		if (fields[key]) { /* watch out for field exclusion */
			sql.field(key);
		}
	});

	var clause = '';

	var keys = Object.keys(query);

	keys.forEach(function (key, index) {
		clause += parse_query_key(key, query[key]);

		if (index !== keys.length - 1) {
			clause += ' AND ';
		}
	});

	sql.where(clause);

	return sql.toString();
}

var query = {
	'field': {
		'$or': [{
			'$gt': 1
		},
		{
			'$gt': 2
		}]
	},
	'field2': {
		'$in': ['1', 2]
	}
};

var fields = {
	'field': 1
};

console.log(find('foo', query, fields));