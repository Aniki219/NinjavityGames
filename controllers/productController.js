const database = require('../services/database');

exports.getAllProducts = async (req, res) => {
    try {
        const result = await database.pool.query(`
            SELECT p.id, p.name, p.description, p.price, 
                p.currency, p.quantity, p.created_at, p.updated_at,
                (SELECT ROW_TO_JSON(category_obj) FROM (
                    SELECT id, name FROM category WHERE id = p.category_id
                ) category_obj
                ) AS category
            FROM product p`
        );

        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}

exports.createProduct = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(422).json({error: "name is required"})
        }

        if (!req.body.price) {
            return res.status(422).json({error: "price is required"})
        }
        
        if (!req.body.category_id) {
            return res.status(422).json({error: "category_id is required"})
        } else {
            const existsCategory = await database.pool.query({
                text: 'SELECT EXISTS (SELECT * FROM category WHERE id = $1)',
                values: [req.body.category_id]
            })
            if (!existsCategory.rows[0].exists) {
                return res.status(422).json({error: `category_id ${req.body.category_id} not found`})
            }
        }

        const existsResult = await database.pool.query({
            text: 'SELECT EXISTS (SELECT * FROM product WHERE name = $1)',
            values: [req.body.name]
        })

        if (existsResult.rows[0].exists) {
            return res.status(409).json({
                error: `Product ${req.body.name} already exists`
            })
        }

        const result = await database.pool.query({
            text: `INSERT INTO product (name, description, price, currency, quantity, active, category_id) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING *`,
            values: [
                req.body.name,
                req.body.description ? req.body.description : null,
                req.body.price,
                req.body.currency ? req.body.currency : 'USD',
                req.body.quantity ? req.body.quantity : 0,
                req.body.active ? req.body.active : true,
                req.body.category_id
            ]
        })
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}