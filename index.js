var squel = require('squel');

function parse_query_key(sql, key, value, previous_key) {
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
			sql.where(previous_key + ' > ' + value);
			break;

		case '$gte':
			sql.where(previous_key + ' >= ' + value);
			break;

		case '$lt':
			sql.where(previous_key + ' < ' + value);
			break;

		case '$lte':
			sql.where(previous_key + ' <= ' + value);
			break;

		case '$ne':
			sql.where(previous_key + ' <> ' + value);
			break;

		case '$nin':
			throw new Error('Unsupported');
			break;

		case '$in':
			throw new Error('Unsupported');
			break;

		/* element operators */
		case '$exists':
			throw new Error('Unsupported');
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
			throw new Error('Unsupported');
			break;

		case '$nor':
			throw new Error('Unsupported');
			break;

		case '$not':
			throw new Error('Unsupported');
			break;

		default: {
			if (typeof value === 'number') {
				sql.where(key + ' = ' + value);
			}

			else if (typeof value === 'string') {
				sql.where(key + ' = ' + value);
			}

			else if (typeof value === 'object') {
				if (value === null) {
					sql.where(key + ' = ' + value);
				}

				else if (Array.isArray(value)) {

				}

				else {
					Object.keys(value).forEach(function (obj_key) {
						parse_query_key(sql, obj_key, value[obj_key], key);
					});
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

	Object.keys(query).forEach(function (key) {
		parse_query_key(sql, key, query[key]);
	});

	return sql.toString();
}

var query = {
	'field': {
		'$gt': 1
	},
	'field2': {
		'$lt': 2
	}
};

var fields = {
	'field': 1
};

console.log(find('foo', query, fields));