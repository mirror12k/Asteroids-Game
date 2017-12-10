


function line_intersection(p, pr, q, qs) {
	var r = { px: pr.px - p.px, py: pr.py - p.py };
	var s = { px: qs.px - q.px, py: qs.py - q.py };
	var p_q = { px: q.px - p.px, py: q.py - p.py };
	var rxs = r.px * s.py - r.py * s.px;
	if (rxs === 0)
		return undefined;
	var p_qxs = p_q.px * s.py - p_q.py * s.px;
	var p_qxr = p_q.px * r.py - p_q.py * r.px;
	var t = p_qxs / rxs;
	var u = p_qxr / rxs;
	// console.log("t:", t, "u:", u);

	return { px: p.px + r.px * t, py: p.py + r.py * t };
	// return { px: q.px + s.px * u, py: q.py + s.py * u };
}

function segment_intersection(p, pr, q, qs) {
	var r = { px: pr.px - p.px, py: pr.py - p.py };
	var s = { px: qs.px - q.px, py: qs.py - q.py };
	var p_q = { px: q.px - p.px, py: q.py - p.py };
	var rxs = r.px * s.py - r.py * s.px;
	if (rxs === 0)
		return undefined;
	var p_qxs = p_q.px * s.py - p_q.py * s.px;
	var p_qxr = p_q.px * r.py - p_q.py * r.px;
	var t = p_qxs / rxs;
	var u = p_qxr / rxs;
	// console.log("t:", t, "u:", u);

	if (t >= 0 && 1 >= t && u >= 0 && 1 >= u)
		return { px: p.px + r.px * t, py: p.py + r.py * t };
	else
		return undefined;
	// return { px: q.px + s.px * u, py: q.py + s.py * u };
}



function all_translated_points(game, pxy) {
	return [
		{ px: pxy.px, py: pxy.py },
		
		{ px: pxy.px - game.canvas.width, py: pxy.py },
		{ px: pxy.px, py: pxy.py - game.canvas.height },
		{ px: pxy.px + game.canvas.width, py: pxy.py },
		{ px: pxy.px, py: pxy.py + game.canvas.height },

		{ px: pxy.px + game.canvas.width, py: pxy.py + game.canvas.height },
		{ px: pxy.px - game.canvas.width, py: pxy.py + game.canvas.height },
		{ px: pxy.px + game.canvas.width, py: pxy.py - game.canvas.height },
		{ px: pxy.px - game.canvas.width, py: pxy.py - game.canvas.height },
	];
}

function wrapped_point (game, pxy) {
	var wrapped_pxy = { px: pxy.px, py: pxy.py };
	if (wrapped_pxy.px < 0) {
		wrapped_pxy.px += game.canvas.width;
	} else if (wrapped_pxy.px >= game.canvas.width) {
		wrapped_pxy.px -= game.canvas.width;
	}
	if (wrapped_pxy.py < 0) {
		wrapped_pxy.py += game.canvas.height;
	} else if (wrapped_pxy.py >= game.canvas.height) {
		wrapped_pxy.py -= game.canvas.height;
	}
	return wrapped_pxy;
}

function border_point (game, pxy, offset) {
	var border_pxy = { px: pxy.px, py: pxy.py };
	if (border_pxy.px <= offset)
		border_pxy.px += offset;
	if (border_pxy.py <= offset)
		border_pxy.py += offset;
	if (border_pxy.px >= game.canvas.width - offset)
		border_pxy.px -= offset;
	if (border_pxy.py >= game.canvas.height - offset)
		border_pxy.py -= offset;

	return border_pxy;
}


function cross_product_from_base(b, bp, bq) {
	var p = { px: bp.px - b.px, py: bp.py - b.py };
	var q = { px: bq.px - b.px, py: bq.py - b.py };
	var cross_product = p.px * q.py - p.py * q.px;
	return cross_product;
}

// function DebugEntity(game, player_ship) {
// 	Entity.call(this, game);
// 	this.player_ship = player_ship;
// }
// DebugEntity.prototype = Object.create(Entity.prototype);
// DebugEntity.prototype.constructor = DebugEntity;
// timer = 60;
// DebugEntity.prototype.draw = function(ctx) {
// 	Entity.prototype.draw.call(this, ctx);

// 	var offset = point_offset(this.player_ship.angle, 200);
// 	var s1 = [{ px: this.player_ship.px, py: this.player_ship.py }, { px: this.player_ship.px + offset.px, py: this.player_ship.py + offset.py }];
// 	var s2 = [{ px: 0, py: 0 }, { px: ctx.canvas.width, py: ctx.canvas.height }];


// 	timer++;
// 	if (timer >= 60) {
// 		timer = 0;
// 		this.intersection = segment_intersection(s1[0], s1[1], s2[0], s2[1]);
// 	}

// 	ctx.beginPath();
// 	ctx.lineWidth = 3;
// 	ctx.strokeStyle = '#f08';
// 	ctx.moveTo(s1[0].px,s1[0].py);
// 	ctx.lineTo(s1[1].px,s1[1].py);
// 	ctx.stroke();

// 	ctx.beginPath();
// 	ctx.lineWidth = 3;
// 	ctx.strokeStyle = '#f00';
// 	ctx.moveTo(s2[0].px,s2[0].py);
// 	ctx.lineTo(s2[1].px,s2[1].py);
// 	ctx.stroke();

// 	if (this.intersection) {
// 		ctx.beginPath();
// 		ctx.lineWidth = 2;
// 		ctx.strokeStyle = '#0f0';
// 		ctx.rect(this.intersection.px - 2, this.intersection.py - 2, 4, 4);
// 		ctx.stroke();
// 	}
// };

function WrappingPathEntity(game, px, py, width, height, image, path) {
	PathEntity.call(this, game, px, py, width, height, image, path);
	this.disable_wrapping_first_time = true;
}
WrappingPathEntity.prototype = Object.create(PathEntity.prototype);
WrappingPathEntity.prototype.constructor = WrappingPathEntity;
WrappingPathEntity.prototype.update = function(game) {
	PathEntity.prototype.update.call(this, game);

	if (this.disable_wrapping_first_time) {
		// perform check to see if the entity has completely entered the field
		// and it is time to enable wrapping
		if (this.px - this.width / 2 >= 0 && this.px + this.width / 2 < game.canvas.width &&
				this.py - this.height / 2 >= 0 && this.py + this.height / 2 < game.canvas.height) {
			this.disable_wrapping_first_time = false;
		}
	} else {
		var wrapped = wrapped_point(game, this);
		this.px = wrapped.px;
		this.py = wrapped.py;
	}
};
WrappingPathEntity.prototype.draw = function(ctx) {
	PathEntity.prototype.draw.call(this, ctx);

	if (this.visible && !this.disable_wrapping_first_time) {
		// console.log('debug: ', ctx.canvas.width, ctx.canvas.height);
		var store_px = this.px;
		var store_py = this.py;

		var wrapped_px;
		if (this.px - this.width / 2 < 0) {
			wrapped_px = this.px + ctx.canvas.width;
		} else if (this.px + this.width / 2 >= ctx.canvas.width) {
			wrapped_px = this.px - ctx.canvas.width;
		} else {
			wrapped_px = this.px;
		}

		var wrapped_py;
		if (this.py - this.height / 2 < 0) {
			wrapped_py = this.py + ctx.canvas.height;
		} else if (this.py + this.height / 2 >= ctx.canvas.height) {
			wrapped_py = this.py - ctx.canvas.height;
		} else {
			wrapped_py = this.py;
		}

		if (wrapped_px !== this.px) {
			this.px = wrapped_px;
			PathEntity.prototype.draw.call(this, ctx);
			this.px = store_px;
		}

		if (wrapped_py !== this.py) {
			this.py = wrapped_py;
			PathEntity.prototype.draw.call(this, ctx);
			this.py = store_py;
		}
		if (wrapped_px !== this.px && wrapped_py !== this.py) {
			this.px = wrapped_px;
			this.py = wrapped_py;
			PathEntity.prototype.draw.call(this, ctx);
			this.px = store_px;
			this.py = store_py;
		}
	}
};

// // hack to make colliding entities also wrapping
// CollidingEntity.prototype.__proto__ = WrappingPathEntity.prototype;

function WrappingCollidingEntity(game, px, py, width, height, image, path) {
	WrappingPathEntity.call(this, game, px, py, width, height, image, path);
}
WrappingCollidingEntity.prototype = Object.create(WrappingPathEntity.prototype);
WrappingCollidingEntity.prototype.constructor = WrappingCollidingEntity;
WrappingCollidingEntity.prototype.class_name = 'WrappingCollidingEntity';
WrappingCollidingEntity.prototype.collision_radius = 10;
WrappingCollidingEntity.prototype.collision_map = [];

WrappingCollidingEntity.prototype.update = function(game) {
	WrappingPathEntity.prototype.update.call(this, game);

	var store_px = this.px;
	var store_py = this.py;

	// modified wrapping algorithm to force wrapping for all possible cases
	// wrapping covers collisions up to half a screen away
	var wrapped_px;
	if (this.px < game.canvas.width / 2) {
		wrapped_px = this.px + game.canvas.width;
	} else {
		wrapped_px = this.px - game.canvas.width;
	}

	var wrapped_py;
	if (this.py < game.canvas.height / 2) {
		wrapped_py = this.py + game.canvas.height;
	} else {
		wrapped_py = this.py - game.canvas.height;
	}

	this.check_collision(game);

	if (!this.disable_wrapping_first_time) {
		this.px = wrapped_px;
		this.check_collision(game);
		this.px = store_px;

		this.py = wrapped_py;
		this.check_collision(game);
		this.py = store_py;

		this.px = wrapped_px;
		this.py = wrapped_py;
		this.check_collision(game);
		this.px = store_px;
		this.py = store_py;
	}
};
WrappingCollidingEntity.prototype.check_collision = function(game) {
	for (var i = 0; i < this.collision_map.length; i++) {
		// console.log("debug: ", this.collision_radius + this.collision_map[i].class.prototype.collision_radius);
		// var colliding = game.find_near(this, this.collision_map[i].class, this.collision_radius + this.collision_map[i].class.prototype.collision_radius);
		var colliding = game.find_colliding_circular(this, this.collision_map[i].class, this.collision_radius);
		for (var k = 0; k < colliding.length; k++) {
			this[this.collision_map[i].callback](game, colliding[k]);
		}
	}
};


function Asteroid(game, px, py, path) {
	WrappingCollidingEntity.call(this, game, px, py, 64, 64, game.images.asteroid_64, path);
	this.angle = Math.random() * 360;
	this.rotation = Math.random() * 2 - 1;
}
Asteroid.prototype = Object.create(WrappingCollidingEntity.prototype);
Asteroid.prototype.collision_radius = 30;
Asteroid.prototype.collision_map = [
	{
		class: PlayerMissile,
		callback: 'hit_missile',
	},
	{
		class: Explosion,
		callback: 'hit',
	},
	{
		class: PlayerShip,
		callback: 'hit_player',
	},
];
Asteroid.prototype.hit_missile = function(game, other) {
	if (!other.dead) {
		this.hit(game, other);
		game.entities_to_remove.push(other);
		other.hit(game, this);
	}
};
Asteroid.prototype.hit = function(game, other) {
	game.entities_to_remove.push(this);
};
Asteroid.prototype.hit_player = function(game, other) {
	this.hit(game, other);
	game.entities_to_remove.push(other);
	// spawn rocket explosion particles
	for (var i = 0; i < 25; i++) {
		game.particle_systems.fire_particles.add_particle(other.px, other.py, 4);
	}
};

function LargeAsteroid(game, px, py, path) {
	Asteroid.call(this, game, px, py, path);
	this.width = 128;
	this.height = 128;
}
LargeAsteroid.prototype = Object.create(Asteroid.prototype);
LargeAsteroid.prototype.collision_radius = 60;
LargeAsteroid.prototype.hit = function(game, other) {
	Asteroid.prototype.hit.call(this, game, other);

	var spawn_count = 2 + Math.floor(Math.random() * 2);
	for (var i = 0; i < spawn_count; i++) {
		if (Math.random() < 0.5) {
			var path = [ { angle: this.path[this.path_index - 1].angle + Math.random() * 90 - 45,
					speed: this.path[this.path_index - 1].speed * (1 + Math.random() * 1 - 0.5), }, ];
			var child = new MediumAsteroid(game, this.px, this.py, path);
			child.disable_wrapping_first_time = false;
			game.entities_to_add.push(child);
		} else {
			var path = [ { angle: this.path[this.path_index - 1].angle + Math.random() * 90 - 45,
					speed: this.path[this.path_index - 1].speed * (1 + Math.random() * 1 - 0.5), }, ];
			var child = new SmallAsteroid(game, this.px, this.py, path);
			child.disable_wrapping_first_time = false;
			game.entities_to_add.push(child);
		}
	}
};

function ExplosiveCharge(game, px, py) {
	ScreenEntity.call(this, game, px, py, 12, 12, game.images.explosive_charge);
	this.angle = Math.random() * 360;
}
ExplosiveCharge.prototype = Object.create(ScreenEntity.prototype);

function SteelPlate(game, px, py, path) {
	ScreenEntity.call(this, game, px, py, 24, 24, game.images.steel_asteroid_plates, path);
	this.max_frame = 4;
	this.frame = Math.floor(Math.random() * 4);
}
SteelPlate.prototype = Object.create(ScreenEntity.prototype);

function LargeSteelPlate(game, px, py, path) {
	ScreenEntity.call(this, game, px, py, 48, 48, game.images.steel_asteroid_plates, path);
	this.max_frame = 4;
	this.frame = Math.floor(Math.random() * 4);
}
LargeSteelPlate.prototype = Object.create(ScreenEntity.prototype);

function Explosion(game, px, py, animation_offset) {
	var size_factor = 1 + Math.random() * 0.25;
	WrappingCollidingEntity.call(this, game, px, py, 64 * size_factor, 64 * size_factor, game.images.explosion);
	this.angle = Math.random() * 360;
	this.animation_index = animation_offset;
	this.max_frame = 6;
}
Explosion.prototype = Object.create(WrappingCollidingEntity.prototype);
Explosion.prototype.collision_radius = 32;
Explosion.prototype.collision_map = [
	{
		class: PlayerShip,
		callback: 'hit_player',
	},
];
Explosion.prototype.update = function(game) {
	WrappingCollidingEntity.prototype.update.call(this, game);
	this.animation_index++;
	this.frame = Math.floor(this.animation_index / 4);
	if (this.frame >= this.max_frame) {
		game.entities_to_remove.push(this);
	}

	game.game_systems.debug_system.add_debug_square(this, this.collision_radius * 2);
};
Explosion.prototype.hit_player = function(game, other) {
	game.entities_to_remove.push(other);
	// spawn rocket explosion particles
	for (var i = 0; i < 25; i++) {
		game.particle_systems.fire_particles.add_particle(other.px, other.py, 4);
	}
};

function EMPExplosion(game, px, py, animation_offset) {
	var size_factor = 1 + Math.random() * 2;
	WrappingCollidingEntity.call(this, game, px, py, 128 * size_factor, 128 * size_factor, game.images.emp_explosion);
	this.angle = Math.random() * 360;
	this.animation_index = animation_offset;
	this.max_frame = 6;

	this.collision_radius = 128 * size_factor / 2;
}
EMPExplosion.prototype = Object.create(WrappingCollidingEntity.prototype);
EMPExplosion.prototype.collision_radius = 32;
EMPExplosion.prototype.collision_map = [
	{
		class: PlayerShip,
		callback: 'hit_player',
	},
];
EMPExplosion.prototype.update = function(game) {
	WrappingCollidingEntity.prototype.update.call(this, game);
	this.animation_index++;
	this.frame = Math.floor(this.animation_index / 4);
	if (this.frame >= this.max_frame) {
		game.entities_to_remove.push(this);
	}

	game.game_systems.debug_system.add_debug_square(this, this.collision_radius * 2);
};
EMPExplosion.prototype.hit_player = function(game, other) {
	var tag = other.get_tag(EMPStatusEffectTag);
	if (tag) {
		tag.timer = 90;
	} else {
		other.entity_tags.push(new EMPStatusEffectTag());
	}
	// game.entities_to_remove.push(other);
	// // spawn rocket explosion particles
	// for (var i = 0; i < 25; i++) {
	// 	game.particle_systems.fire_particles.add_particle(other.px, other.py, 4);
	// }
};

function MediumAsteroid(game, px, py, path) {
	Asteroid.call(this, game, px, py, path);
	this.width = 64;
	this.height = 64;
}
MediumAsteroid.prototype = Object.create(Asteroid.prototype);
MediumAsteroid.prototype.collision_radius = 30;
MediumAsteroid.prototype.hit = function(game, other) {
	Asteroid.prototype.hit.call(this, game, other);
	var spawn_count = 1 + Math.floor(Math.random() * 2);
	for (var i = 0; i < spawn_count; i++) {
		var path = [ { angle: this.path[this.path_index - 1].angle + Math.random() * 90 - 45,
				speed: this.path[this.path_index - 1].speed * (1 + Math.random() * 1 - 0.5), }, ];
		var child = new SmallAsteroid(game, this.px, this.py, path);
		child.disable_wrapping_first_time = false;
		game.entities_to_add.push(child);
	}
};

function MediumExplosivesAsteroid(game, px, py, path) {
	MediumAsteroid.call(this, game, px, py, path);
	this.width = 64;
	this.height = 64;

	var count = 3 + Math.floor(Math.random() * 3);
	for (var i = 0; i < count; i++) {
		var offset = point_offset((360 / count) * i + Math.random() * (360 / count / 2), Math.random() * this.collision_radius / 1.2);
		var charge = new ExplosiveCharge(game, offset.px, offset.py);
		this.sub_entities.push(charge);
	}
}
MediumExplosivesAsteroid.prototype = Object.create(MediumAsteroid.prototype);
MediumExplosivesAsteroid.prototype.collision_radius = 30;
MediumExplosivesAsteroid.prototype.hit = function(game, other) {
	MediumAsteroid.prototype.hit.call(this, game, other);
	var count = 3 + Math.floor(Math.random() * 3);
	for (var i = 0; i < count; i++) {
		var offset = point_offset((360 / count) * i + Math.random() * (360 / count / 2), Math.random() * this.collision_radius * 1.8);
		game.entities_to_add.push(new Explosion(game, this.px + offset.px, this.py + offset.py, Math.floor(Math.random() * 8)));
	}
};

function ExplosiveMine(game, px, py, path) {
	Asteroid.call(this, game, px, py, path);
	this.image = game.images.explosive_mine;
	this.width = 32;
	this.height = 32;
}
ExplosiveMine.prototype = Object.create(Asteroid.prototype);
ExplosiveMine.prototype.collision_radius = 20;
ExplosiveMine.prototype.update = function(game) {
	Asteroid.prototype.update.call(this, game);
	var self = this;

	if (!this.disable_wrapping_first_time) {
		var target = game.query_entities(PlayerShip)[0];
		if (target) {
			var positions = all_translated_points(game, target);

			positions.sort(function (a, b) {
				return points_dist(self, a) - points_dist(self, b);
			});

			var best_position = positions[0];

			var angle = point_angle(this.px, this.py, best_position.px, best_position.py);
			this.path[this.path_index - 1].sx = Math.cos(angle / 180 * Math.PI) * this.path[this.path_index - 1].speed;
			this.path[this.path_index - 1].sy = Math.sin(angle / 180 * Math.PI) * this.path[this.path_index - 1].speed;
		}
	}
};
ExplosiveMine.prototype.hit = function(game, other) {
	Asteroid.prototype.hit.call(this, game, other);
	var count = 3 + Math.floor(Math.random() * 3);
	for (var i = 0; i < count; i++) {
		var offset = point_offset((360 / count) * i + Math.random() * (360 / count / 2), Math.random() * this.collision_radius * 1.8);
		game.entities_to_add.push(new Explosion(game, this.px + offset.px, this.py + offset.py, Math.floor(Math.random() * 8)));
	}
};

function PlatedAsteroidEntity(game, px, py, path) {
	Asteroid.call(this, game, px, py, path);
}
PlatedAsteroidEntity.prototype = Object.create(Asteroid.prototype);
// PlatedAsteroidEntity.prototype.collision_radius = 60;
PlatedAsteroidEntity.prototype.hit = function(game, other) {
	// override hit to calculate when sub entities are hit
	var is_sub_entity_hit = false;
	for (var i = this.sub_entities.length - 1; i >= 0; i--) {
		var ent = this.sub_entities[i];
		var offset = d2_point_offset(this.angle, ent.px, ent.py);
		var p = { px: this.px + offset.px, py: this.py + offset.py };

		if (points_dist(p, other) < ent.collision_radius + other.collision_radius) {
			is_sub_entity_hit = true;
			this.hit_plate(game, other, ent);
			break;
		}
	}

	if (!is_sub_entity_hit) {
		this.hit_self(game, other);
	}
};

function SuperMine(game, px, py, path) {
	PlatedAsteroidEntity.call(this, game, px, py, path);
	this.image = game.images.super_mine;
	this.width = 128;
	this.height = 128;

	this.health = 4;

	this.spawn_step = 0;
	this.spawn_entity = undefined;

	this.rotation = Math.random() * 0.2 - 0.1;

	this.support_crystals = [];
	var ent = new ScreenEntity(game, 56, 0, 32, 32, game.images.red_crystal);
	ent.collision_radius = 16;
	this.sub_entities.push(ent);
	var ent = new ScreenEntity(game, -56, 0, 32, 32, game.images.red_crystal);
	ent.collision_radius = 16;
	this.sub_entities.push(ent);
	var ent = new ScreenEntity(game, 0, 56, 32, 32, game.images.red_crystal);
	ent.collision_radius = 16;
	this.sub_entities.push(ent);
	var ent = new ScreenEntity(game, 0, -56, 32, 32, game.images.red_crystal);
	ent.collision_radius = 16;
	this.sub_entities.push(ent);
}
SuperMine.prototype = Object.create(PlatedAsteroidEntity.prototype);
SuperMine.prototype.collision_radius = 60;
SuperMine.prototype.update = function(game) {
	PlatedAsteroidEntity.prototype.update.call(this, game);
	var self = this;

	if (this.spawn_entity) {
		this.spawn_step++;
		if (this.spawn_step >= 240) {
			this.remove_entity(this.spawn_entity);
			var offset = d2_point_offset(this.angle, this.spawn_entity.px, this.spawn_entity.py);
			var mine = new ExplosiveMine(game, this.px + offset.px, this.py + offset.py, [{
				angle: this.angle,
				speed: 1,
			}]);
			mine.disable_wrapping_first_time = false;
			game.entities_to_add.push(mine);

			this.spawn_entity = undefined;
		} else {
			this.spawn_entity.px = this.spawn_step / 4;
			this.spawn_entity.py = this.spawn_step / 4;
		}
	} else {

		var active_mines = game.query_entities(ExplosiveMine);
		if (active_mines.length < 4) {
			this.spawn_step = 0;
			this.spawn_entity = new ScreenEntity(game, 0, 0, 32, 32, game.images.explosive_mine);
			this.spawn_entity.z_index = -1;
			this.add_entity(this.spawn_entity);
		}
	}
};
SuperMine.prototype.hit_plate = function(game, other, ent) {
	this.health--;
	this.remove_entity(ent);

	if (this.health <= 0) {
		Asteroid.prototype.hit.call(this, game, other);

		var count = 3 + Math.floor(Math.random() * 3);
		for (var i = 0; i < count; i++) {
			var offset = point_offset((360 / count) * i + Math.random() * (360 / count / 2), Math.random() * this.collision_radius * 1.8);
			game.entities_to_add.push(new Explosion(game, this.px + offset.px, this.py + offset.py, Math.floor(Math.random() * 8)));
		}
	}
};
SuperMine.prototype.hit_self = function(game, other) {
	// nothing, body is immune
};

function EMPMine(game, px, py, path) {
	Asteroid.call(this, game, px, py, path);
	this.image = game.images.emp_mine;
	this.width = 32;
	this.height = 32;
}
EMPMine.prototype = Object.create(Asteroid.prototype);
EMPMine.prototype.collision_radius = 20;
EMPMine.prototype.hit = function(game, other) {
	Asteroid.prototype.hit.call(this, game, other);
	var count = 1;
	for (var i = 0; i < count; i++) {
		var offset = point_offset((360 / count) * i + Math.random() * (360 / count / 2), Math.random() * this.collision_radius * 1.8);
		game.entities_to_add.push(new EMPExplosion(game, this.px + offset.px, this.py + offset.py, Math.floor(Math.random() * 8)));
	}
};

function MediumSteelAsteroid(game, px, py, path) {
	Asteroid.call(this, game, px, py, path);
	this.image = game.images.steel_asteroid_base;
	this.width = 64;
	this.height = 64;

	this.health = 3;

	var count = 15 + Math.floor(Math.random() * 10);
	for (var i = 0; i < count; i++) {
		var angle = (360 / count) * i + Math.random() * (360 / count / 2);
		var offset_distance = Math.random() * this.collision_radius * 1.5;
		if (offset_distance > this.collision_radius)
			offset_distance = this.collision_radius;
		var offset = point_offset(angle, offset_distance);
		var plate = new SteelPlate(game, offset.px, offset.py);
		plate.angle = angle;
		this.sub_entities.push(plate);
	}
}
MediumSteelAsteroid.prototype = Object.create(Asteroid.prototype);
MediumSteelAsteroid.prototype.collision_radius = 30;
MediumSteelAsteroid.prototype.hit = function(game, other) {
	this.health--;
	if (this.health <= 0) {
		Asteroid.prototype.hit.call(this, game, other);
	}

	for (var i = this.sub_entities.length - 1; i >= 0; i--) {
		if (Math.random() < 0.4) {
			var ent = this.sub_entities[i];
			var offset = d2_point_offset(this.angle, ent.px, ent.py);
			game.particle_systems.steel_plate_particles.add_particle(this.px + offset.px, this.py + offset.py, 3, ent.frame, ent.angle + this.angle);
			this.sub_entities.splice(i, 1);
		}
	}
};

function GiantSteelAsteroid(game, px, py, path) {
	Asteroid.call(this, game, px, py, path);
	this.image = game.images.steel_asteroid_base;
	this.width = 256;
	this.height = 256;
	this.angle_granularity = 2;
	this.rotation = Math.random() * 0.2 - 0.1;

	this.health = 30;

	this.collision_radius = 120;

	this.inner_ring = [];
	var count = 25 + Math.floor(Math.random() * 10);
	for (var i = 0; i < count; i++) {
		var angle = (360 / count) * i + Math.random() * (360 / count / 2);
		var offset_distance = Math.random() * this.collision_radius * 0.25;
		var offset = point_offset(angle, offset_distance);
		var plate = new SteelPlate(game, offset.px, offset.py);
		plate.angle = angle;
		this.inner_ring.push(plate);
		this.sub_entities.push(plate);
	}

	this.middle_ring = [];
	var count = 40 + Math.floor(Math.random() * 20);
	for (var i = 0; i < count; i++) {
		var angle = (360 / count) * i + Math.random() * (360 / count / 2);
		var offset_distance = Math.min(this.collision_radius * 0.25 + Math.random() * this.collision_radius * 0.5, this.collision_radius * 0.6);
		var offset = point_offset(angle, offset_distance);
		var plate = new SteelPlate(game, offset.px, offset.py);
		plate.angle = angle;
		this.middle_ring.push(plate);
		this.sub_entities.push(plate);
	}

	this.outer_ring = [];
	var count = 80 + Math.floor(Math.random() * 20);
	for (var i = 0; i < count; i++) {
		var angle = (360 / count) * i + Math.random() * (360 / count / 2);
		var offset_distance = Math.min(this.collision_radius * 0.6 + Math.random() * this.collision_radius * 0.5, this.collision_radius * 1);
		var offset = point_offset(angle, offset_distance);
		var plate = new SteelPlate(game, offset.px, offset.py);
		plate.angle = angle;
		this.outer_ring.push(plate);
		this.sub_entities.push(plate);
	}

	this.super_outer_ring = [];
	var count = 120 + Math.floor(Math.random() * 20);
	for (var i = 0; i < count; i++) {
		var angle = (360 / count) * i + Math.random() * (360 / count / 2);
		var offset_distance = Math.min(this.collision_radius * 0.6 + Math.random() * this.collision_radius * 1.2, this.collision_radius * 1.2);
		var offset = point_offset(angle, offset_distance);
		var plate = new SteelPlate(game, offset.px, offset.py);
		plate.angle = angle;
		this.super_outer_ring.push(plate);
		this.sub_entities.push(plate);
	}
}
GiantSteelAsteroid.prototype = Object.create(Asteroid.prototype);
GiantSteelAsteroid.prototype.hit = function(game, other) {
	this.health--;
	if (this.health <= 0) {
		Asteroid.prototype.hit.call(this, game, other);

		for (var i = 0; i < this.inner_ring.length; i++) {
			var ent = this.inner_ring[i];
			var offset = d2_point_offset(this.angle, ent.px, ent.py);
			var point = { px: this.px + offset.px, py: this.py + offset.py };
			if (!this.disable_wrapping_first_time)
				point = wrapped_point(game, point);
			game.particle_systems.steel_plate_particles.add_particle(point.px, point.py, 3, ent.frame, ent.angle + this.angle);
			this.sub_entities.splice(this.sub_entities.indexOf(ent), 1);
		}
		this.collision_radius = 30;
		this.inner_ring = [];
	} else if (this.health <= 5) {
		for (var i = 0; i < this.middle_ring.length; i++) {
			var ent = this.middle_ring[i];
			var offset = d2_point_offset(this.angle, ent.px, ent.py);
			var point = { px: this.px + offset.px, py: this.py + offset.py };
			if (!this.disable_wrapping_first_time)
				point = wrapped_point(game, point);
			game.particle_systems.steel_plate_particles.add_particle(point.px, point.py, 3, ent.frame, ent.angle + this.angle);
			this.sub_entities.splice(this.sub_entities.indexOf(ent), 1);
		}
		this.collision_radius = 30;
		this.middle_ring = [];

		for (var i = this.inner_ring.length - 1; i >= 0; i--) {
			if (Math.random() < 0.2) {
				var ent = this.inner_ring[i];
				var offset = d2_point_offset(this.angle, ent.px, ent.py);
				var point = { px: this.px + offset.px, py: this.py + offset.py };
				if (!this.disable_wrapping_first_time)
					point = wrapped_point(game, point);
				game.particle_systems.steel_plate_particles.add_particle(point.px, point.py, 3, ent.frame, ent.angle + this.angle);
				this.sub_entities.splice(this.sub_entities.indexOf(ent), 1);
				this.inner_ring.splice(i, 1);
			}
		}
	} else if (this.health <= 10) {
		for (var i = 0; i < this.outer_ring.length; i++) {
			var ent = this.outer_ring[i];
			var offset = d2_point_offset(this.angle, ent.px, ent.py);
			var point = { px: this.px + offset.px, py: this.py + offset.py };
			if (!this.disable_wrapping_first_time)
				point = wrapped_point(game, point);
			game.particle_systems.steel_plate_particles.add_particle(point.px, point.py, 3, ent.frame, ent.angle + this.angle);
			this.sub_entities.splice(this.sub_entities.indexOf(ent), 1);
		}
		this.collision_radius = 60;
		this.outer_ring = [];

		for (var i = this.middle_ring.length - 1; i >= 0; i--) {
			if (Math.random() < 0.1) {
				var ent = this.middle_ring[i];
				var offset = d2_point_offset(this.angle, ent.px, ent.py);
				var point = { px: this.px + offset.px, py: this.py + offset.py };
				if (!this.disable_wrapping_first_time)
					point = wrapped_point(game, point);
				game.particle_systems.steel_plate_particles.add_particle(point.px, point.py, 3, ent.frame, ent.angle + this.angle);
				this.sub_entities.splice(this.sub_entities.indexOf(ent), 1);
				this.middle_ring.splice(i, 1);
			}
		}
	} else if (this.health <= 20) {
		for (var i = 0; i < this.super_outer_ring.length; i++) {
			var ent = this.super_outer_ring[i];
			var offset = d2_point_offset(this.angle, ent.px, ent.py);
			var point = { px: this.px + offset.px, py: this.py + offset.py };
			if (!this.disable_wrapping_first_time)
				point = wrapped_point(game, point);
			game.particle_systems.steel_plate_particles.add_particle(point.px, point.py, 3, ent.frame, ent.angle + this.angle);
			this.sub_entities.splice(this.sub_entities.indexOf(ent), 1);
		}
		this.collision_radius = 90;
		this.super_outer_ring = [];

		for (var i = this.outer_ring.length - 1; i >= 0; i--) {
			if (Math.random() < 0.1) {
				var ent = this.outer_ring[i];
				var offset = d2_point_offset(this.angle, ent.px, ent.py);
				var point = { px: this.px + offset.px, py: this.py + offset.py };
				if (!this.disable_wrapping_first_time)
					point = wrapped_point(game, point);
				game.particle_systems.steel_plate_particles.add_particle(point.px, point.py, 3, ent.frame, ent.angle + this.angle);
				this.sub_entities.splice(this.sub_entities.indexOf(ent), 1);
				this.outer_ring.splice(i, 1);
			}
		}
	} else {
		for (var i = this.super_outer_ring.length - 1; i >= 0; i--) {
			if (Math.random() < 0.1) {
				var ent = this.super_outer_ring[i];
				var offset = d2_point_offset(this.angle, ent.px, ent.py);
				var point = { px: this.px + offset.px, py: this.py + offset.py };
				if (!this.disable_wrapping_first_time)
					point = wrapped_point(game, point);
				game.particle_systems.steel_plate_particles.add_particle(point.px, point.py, 3, ent.frame, ent.angle + this.angle);
				this.sub_entities.splice(this.sub_entities.indexOf(ent), 1);
				this.super_outer_ring.splice(i, 1);
			}
		}
	}
};




function IcicleCarrier(game, px, py, path) {
	PlatedAsteroidEntity.call(this, game, px, py, path);
	this.image = game.images.icicle_core;
	this.width = 64;
	this.height = 64;
	this.angle_granularity = 2;

	this.rotation = Math.random() * 0.2 - 0.1;

	var count = 8 + Math.floor(Math.random() * 8);
	for (var i = 0; i < count; i++) {
		var angle = (360 / count) * i + Math.random() * (360 / count / 2);
		var offset_distance = 24 + Math.random() * this.collision_radius;
		// if (offset_distance > this.collision_radius)
		// 	offset_distance = this.collision_radius;
		var offset = point_offset(angle, offset_distance);
		var ent = new ScreenEntity(game, offset.px, offset.py, 48, 48, game.images.icicle_cluster);
		ent.angle = angle + Math.random() * (360 / count / 2);
		ent.collision_radius = 20;
		this.sub_entities.push(ent);
	}
}
IcicleCarrier.prototype = Object.create(PlatedAsteroidEntity.prototype);
IcicleCarrier.prototype.collision_radius = 32;
IcicleCarrier.prototype.hit_plate = function(game, other, ent) {
	this.remove_entity(ent);
	
	var offset = d2_point_offset(this.angle, ent.px, ent.py);
	var p = { px: this.px + offset.px, py: this.py + offset.py };

	var target = game.query_entities(PlayerShip)[0];
	if (target) {
		var projectile = new SmallIcicle(game, p.px, p.py, [{
			timeout: 120,
			angle: point_angle(p.px, p.py, target.px, target.py),
			speed: 3,
		}]);
		game.add_entity(projectile);
	}
};
IcicleCarrier.prototype.hit_self = function(game, other) {
	Asteroid.prototype.hit.call(this, game, other);

	for (var i = this.sub_entities.length - 1; i >= 0; i--) {
		var ent = this.sub_entities[i];
		if (Math.random() < 0.5) {
			var offset = d2_point_offset(this.angle, ent.px, ent.py);
			var p = { px: this.px + offset.px, py: this.py + offset.py };

			var projectile = new SmallIcicle(game, p.px, p.py, [{
				timeout: 120,
				angle: ent.angle + this.angle,
				speed: 3,
			}]);
			game.add_entity(projectile);
		}
	}
};



function DodgingUFO(game, px, py, path) {
	Asteroid.call(this, game, px, py, path);
	this.image = game.images.ufo;
	this.width = 64;
	this.height = 64;
}
DodgingUFO.prototype = Object.create(Asteroid.prototype);
DodgingUFO.prototype.collision_radius = 32;
DodgingUFO.prototype.update = function(game) {
	Asteroid.prototype.update.call(this, game);
	var self = this;


	if (!this.disable_wrapping_first_time) {
		var dodge_targets = [];

		var ents = game.query_entities(PlayerMissile);
		for (var i = 0; i < ents.length; i++) {
			var ent = ents[i];
			var positions = all_translated_points(game, ent);
			positions.sort(function (a, b) {
				return points_dist(self, a) - points_dist(self, b);
			});
			var best_position = positions[0];

			if (points_dist(self, best_position) < 200)
				dodge_targets.push([ent, best_position]);
		}
		dodge_targets.sort(function (a, b) {
			return points_dist(self, a[1]) - points_dist(self, b[1]);
		});

		if (dodge_targets.length > 0) {
			var ent = dodge_targets[0][0];
			// console.log("debug dodge:", ent);
			var ent_dest = { px: ent.px + ent.path[0].sx, py: ent.py + ent.path[0].sy };
			var cross = cross_product_from_base(ent, this, ent_dest);
			var angle = point_angle(ent.px, ent.py, ent_dest.px, ent_dest.py);
			var target_angle;
			if (cross > 0) {
				target_angle = angle - 90;
			} else {
				target_angle = angle + 90;
			}
			this.path[this.path_index - 1].sx = Math.cos(target_angle / 180 * Math.PI) * this.path[this.path_index - 1].speed;
			this.path[this.path_index - 1].sy = Math.sin(target_angle / 180 * Math.PI) * this.path[this.path_index - 1].speed;
		}
	}
};


function SmallAsteroid(game, px, py, path) {
	Asteroid.call(this, game, px, py, path);
	this.width = 32;
	this.height = 32;
}
SmallAsteroid.prototype = Object.create(Asteroid.prototype);
SmallAsteroid.prototype.collision_radius = 15;


function SmallIcicle(game, px, py, path) {
	Asteroid.call(this, game, px, py, path);
	this.image = game.images.icicle;
	this.width = 24;
	this.height = 24;

	this.rotation = 0;
}
SmallIcicle.prototype = Object.create(Asteroid.prototype);
SmallIcicle.prototype.collision_radius = 5;


function PlayerShip(game, px, py, path) {
	WrappingCollidingEntity.call(this, game, px, py, 48, 48, game.images.fighter, path);
	this.sx = 0;
	this.sy = 0;
	this.angle_granularity = 5;
	this.fire_timer = 0;
	this.reload_timer = 60;

	this.last_space_input = false;
	this.missile_max = 5;
	this.missile_count = this.missile_max;

	// this.missile_armament = PlayerMissile;
	this.missile_armament = PlayerExplosiveMissile;

	this.entity_tags.push(new PointLightSourceTag());
	this.entity_tags.push(new DirectedLightSourceTag());
}
PlayerShip.prototype = Object.create(WrappingCollidingEntity.prototype);
PlayerShip.prototype.collision_radius = 8;
PlayerShip.prototype.collision_map = [
	// {
	// 	class: Asteroid,
	// 	callback: 'hit_asteroid',
	// },
];
PlayerShip.prototype.update = function(game) {
	// if we arent affected by emp, check input
	if (!this.get_tag(EMPStatusEffectTag)) {
		// input reading to adjust actions
		if (game.keystate.Q) {
			this.angle -= 2;
			this.angle %= 360;
		}
		if (game.keystate.E) {
			this.angle += 2;
			this.angle %= 360;
		}
		if (game.keystate.A) {
			var offset = point_offset(this.angle - 90, 0.05);
			this.sx += offset.px;
			this.sy += offset.py;
		}
		if (game.keystate.D) {
			var offset = point_offset(this.angle + 90, 0.05);
			this.sx += offset.px;
			this.sy += offset.py;
		}

		if (game.keystate.W) {
			var offset = point_offset(this.angle, 0.10);
			this.sx += offset.px;
			this.sy += offset.py;
		}
		if (game.keystate.S) {
			var offset = point_offset(this.angle + 180, 0.05);
			this.sx += offset.px;
			this.sy += offset.py;
		}

		if (game.keystate.W) {
			var offset = d2_point_offset(this.angle, -this.width / 2, -this.height / 8);
			game.particle_systems.fire_particles.add_particle(this.px + offset.px, this.py + offset.py, 1);
			offset = d2_point_offset(this.angle, -this.width / 2, this.height / 8);
			game.particle_systems.fire_particles.add_particle(this.px + offset.px, this.py + offset.py, 1);
		}
		if (game.keystate.S) {
			var offset = d2_point_offset(this.angle, this.width / 4, -this.height / 8);
			game.particle_systems.fire_particles.add_particle(this.px + offset.px, this.py + offset.py, 1);
			offset = d2_point_offset(this.angle, this.width / 4, this.height / 8);
			game.particle_systems.fire_particles.add_particle(this.px + offset.px, this.py + offset.py, 1);
		}
		if (game.keystate.A) {
			var offset = d2_point_offset(this.angle, -this.width / 4, this.height / 2);
			game.particle_systems.fire_particles.add_particle(this.px + offset.px, this.py + offset.py, 1);
		}
		if (game.keystate.D) {
			var offset = d2_point_offset(this.angle, -this.width / 4, -this.height / 2);
			game.particle_systems.fire_particles.add_particle(this.px + offset.px, this.py + offset.py, 1);
		}
	}

	// movement physics
	if (point_dist(this.sx, this.sy) > 5) {
		var speed = point_normal(this.sx, this.sy);
		this.sx = speed.px * 5;
		this.sy = speed.py * 5;
	}

	this.px += this.sx;
	this.py += this.sy;

	if (this.get_tag(EquipedExplosiveMissilesTag)) {
		this.missile_armament = PlayerExplosiveMissile;
	} else {
		this.missile_armament = PlayerMissile;
	}

	// reloading logic
	if (this.missile_count < this.missile_max) {
		if (this.reload_timer) {
			this.reload_timer--;
		} else {
			this.missile_count++;
			this.reload_timer = 60;
		}
	}

	// check input and fire missile
	if (this.fire_timer) {
		this.fire_timer--;
	} else {
		if (game.keystate[' '] && !this.last_space_input && this.missile_count > 0) {
			this.fire(game);
			this.missile_count--;
			this.fire_timer = 5;
		}
	}
	this.last_space_input = game.keystate[' '];

	WrappingCollidingEntity.prototype.update.call(this, game);
};
PlayerShip.prototype.fire = function(game) {
	var offset = point_offset(this.angle, this.width / 2);
	var speed = point_offset(this.angle, 8);

	var trail;
	if (this.missile_armament === PlayerExplosiveMissile) {
		trail = { type: 'fire_particles', thickness: 1, speed: 1.5 };
	} else {
		trail = { type: 'fire_particles', thickness: 0.5, speed: 1 };
	}

	game.entities_to_add.push(new this.missile_armament(game, offset.px + this.px, offset.py + this.py, [
		{
			timeout: 90,
			sx: speed.px + this.sx,
			sy: speed.py + this.sy,
			angle: this.angle,
			// speed: 3,
			trail: trail,
		},
	]));
};
PlayerShip.prototype.hit_asteroid = function(game, other) {
	game.entities_to_remove.push(this);
};




function PlayerMissile(game, px, py, path) {
	WrappingPathEntity.call(this, game, px, py, 16, 16, game.images.missile, path);
	this.angle_granularity = 5;
	this.disable_wrapping_first_time = false;

	this.dead = false;

	// this.entity_tags.push(new PointLightSourceTag());
}
PlayerMissile.prototype = Object.create(WrappingPathEntity.prototype);
PlayerMissile.prototype.collision_radius = 4;
PlayerMissile.prototype.hit = function(game, other) {
	this.dead = true;
	// spawn rocket explosion particles
	for (var i = 0; i < 25; i++) {
		game.particle_systems.fire_particles.add_particle(this.px, this.py, 4);
	}
};


function PlayerExplosiveMissile(game, px, py, path) {
	WrappingPathEntity.call(this, game, px, py, 40, 16, game.images.explosive_missile, path);
	this.angle_granularity = 5;
	this.disable_wrapping_first_time = false;

	// this.entity_tags.push(new PointLightSourceTag());
}
PlayerExplosiveMissile.prototype = Object.create(PlayerMissile.prototype);
PlayerExplosiveMissile.prototype.collision_radius = 8;
PlayerExplosiveMissile.prototype.hit = function(game, other) {
	// spawn rocket explosion
	game.entities_to_add.push(new Explosion(game, this.px, this.py, Math.random() * 8));
};
// PlayerMissile.prototype.collision_map = [
// 	{
// 		class: Asteroid,
// 		callback: 'hit_asteroid',
// 	},
// ];
// PlayerMissile.prototype.hit_asteroid = function(game, other) {
// 	game.entities_to_remove.push(other);
// 	game.entities_to_remove.push(this);
// 	for (var i = 0; i < 25; i++) {
// 		// our position might be wildly offset, so we wrap our position to spawn particles properly
// 		var pos = wrapped_point(game, this);
// 		game.particle_systems.fire_particles.add_particle(pos.px, pos.py, 4);
// 	}
// };


function UIP9Box(game, px, py, width, height, sizex, sizey, image) {
	ScreenEntity.call(this, game, px, py, width, height, image);
	this.sizex = sizex;
	this.sizey = sizey;
	this.angle_granularity = 1;

	this.image = this.render();
	this.width = this.image.width;
	this.height = this.image.height;
}
UIP9Box.prototype = Object.create(ScreenEntity.prototype);
UIP9Box.prototype.render = function() {
	var buffer_canvas = document.createElement('canvas');
	buffer_canvas.width = this.width * this.sizex;
	buffer_canvas.height = this.height * this.sizey;

	var buffer_context = buffer_canvas.getContext('2d');

	var frame_width = this.image.width / 3;
	var frame_height = this.image.height / 3;
	for (var x = 0; x < this.sizex; x++) {
		for (var y = 0; y < this.sizey; y++) {
			var framex, framey;
			if (x === 0) {
				framex = 0;
			} else if ( x < this.sizex - 1) {
				framex = 1;
			} else {
				framex = 2;
			}
			if (y === 0) {
				framey = 0;
			} else if ( y < this.sizey - 1) {
				framey = 1;
			} else {
				framey = 2;
			}
			buffer_context.drawImage(this.image,
				framex * frame_width, framey * frame_height, frame_width, frame_height,
				x * this.width, y * this.height, this.width, this.height);
		}
	}

	return buffer_canvas;
};

function UIMissileDisplay(game, px, py, bucket) {
	UIP9Box.call(this, game, px, py, 12, 8, 8, 4, game.images.p9_green_ui);
	this.bucket = bucket;

	this.missile_displays = [];
	for (var i = 0; i < bucket.missile_max; i++) {
		var ui_entity = new ScreenEntity(game, i * 12 - 12 * bucket.missile_max / 2 + 6, 0, 16, 16, game.images.ui_missile);
		ui_entity.angle = -60;
		this.missile_displays.push(ui_entity);
	}

	this.explosive_missile_displays = [];
	for (var i = 0; i < bucket.missile_max; i++) {
		var ui_entity = new ScreenEntity(game, i * 12 - 12 * bucket.missile_max / 2 + 6, 0, 40, 16, game.images.ui_explosive_missile);
		ui_entity.angle = -60;
		this.explosive_missile_displays.push(ui_entity);
	}

	for (var i = 0; i < this.missile_displays.length; i++) {
		this.sub_entities.push(this.missile_displays[i]);
	}
	for (var i = 0; i < this.explosive_missile_displays.length; i++) {
		this.sub_entities.push(this.explosive_missile_displays[i]);
	}
}
UIMissileDisplay.prototype = Object.create(UIP9Box.prototype);
UIMissileDisplay.prototype.update = function(game) {
	var missile_max = this.bucket.missile_max;

	var missile_count = 0;
	var explosive_missile_count = 0;
	if (this.bucket.missile_armament === PlayerExplosiveMissile) {
		explosive_missile_count = this.bucket.missile_count;
	} else {
		missile_count = this.bucket.missile_count;
	}
	for (var i = 0; i < missile_max; i++) {
		this.missile_displays[i].visible = i < missile_count;
	}
	for (var i = 0; i < missile_max; i++) {
		this.explosive_missile_displays[i].visible = i < explosive_missile_count;
	}
};

function UIWarningSign(game, px, py) {
	ScreenEntity.call(this, game, px, py, 32, 32, game.images.warning_sign);
	this.blink = 60;
	this.blink_count = 3;
}
UIWarningSign.prototype = Object.create(ScreenEntity.prototype);
UIWarningSign.prototype.update = function(game) {
	Entity.prototype.update.call(this, game);
	this.blink--;
	if (this.blink < 0) {
		this.blink_count--;
		if (this.blink_count <= 0)
			game.remove_entity(this);
		else
			this.blink = 60;
	}
	this.visible = this.blink > 20;
};

function NPCDirectorEntity(game, waves) {
	Entity.call(this, game);
	this.waves = waves;
	this.wave_index = 0;
	this.start_next_wave(game);
}
NPCDirectorEntity.prototype = Object.create(Entity.prototype);
NPCDirectorEntity.prototype.update = function(game) {
	Entity.prototype.update.call(this, game);

	if (this.pre_rest === 0) {
		if (this.spawn_timer === 0) {
			var count_asteroids = game.query_entities(Asteroid).length;
			if (count_asteroids < this.max_spawned && this.wave_spawn_count > 0) {
				this.wave_spawn_count--;
				this.spawn_timer = this.spawn_interval;

				for (var i = 0; i < this.batches.length; i++) {
					this.spawn_batch(game, this.batches[i]);
				}
			} else if (count_asteroids <= this.max_spawned_to_end && this.wave_spawn_count === 0) {
				console.log('wave cleared');
				this.start_next_wave(game);
			}
		} else {
			this.spawn_timer--;
		}
	} else {
		this.pre_rest--;
	}
};
NPCDirectorEntity.prototype.start_next_wave = function(game) {
	if (this.wave_index < this.waves.length) {
		// clear tags from previous wave
		if (this.wave_index > 0 && this.waves[this.wave_index-1].wave_tags) {
			for (var i = 0; i < this.waves[this.wave_index-1].wave_tags.length; i++) {
				this.remove_tag(this.waves[this.wave_index-1].wave_tags[i]);
			}
		}
		this.start_wave(game, this.waves[this.wave_index]);
		this.wave_index++;
	} else {
		this.spawn_timer = -1;
		console.log("all waves completed!");
	}
};
NPCDirectorEntity.prototype.start_wave = function(game, wave) {
	this.spawn_interval = wave.spawn_interval || 60;
	this.spawn_timer = this.spawn_interval;
	this.max_spawned = wave.max_spawned || Infinity;
	this.max_spawned_to_end = wave.max_spawned_to_end || 0;
	this.wave_spawn_count = wave.wave_spawn_count || 10;
	this.batches = wave.batches;
	this.pre_rest = wave.pre_rest || 0;

	if (wave.wave_tags) {
		for (var i = 0; i < wave.wave_tags.length; i++) {
			this.entity_tags.push(wave.wave_tags[i]);
		}
	}
};
NPCDirectorEntity.prototype.spawn_batch = function(game, batch) {
	var direction = batch.direction;

	var min_speed = batch.min_speed || 0.5;
	var max_speed = batch.max_speed || 0.5;

	var enemy_type = batch.enemy_type || SmallAsteroid;
	var spawn_count = batch.spawn_count || 1;

	for (var i = 0; i < spawn_count; i++) {
		var path = { speed: min_speed + Math.random() * (max_speed - min_speed), angle: undefined, };
		var asteroid = new enemy_type(game, undefined, undefined, [ path ]);

		var spawn_direction = direction;
		if (spawn_direction === undefined)
			spawn_direction = Math.floor(Math.random() * 4);
		var offsetx, offsety;
		if (spawn_direction === 0) {
			offsetx = game.canvas.width + asteroid.width;
			offsety = Math.random() * game.canvas.height;
		} else if (spawn_direction === 1) {
			offsetx = Math.random() * game.canvas.width;
			offsety = game.canvas.height + asteroid.width;
		} else if (spawn_direction === 2) {
			offsetx = -asteroid.width;
			offsety = Math.random() * game.canvas.height;
		} else {
			offsetx = Math.random() * game.canvas.width;
			offsety = -asteroid.width;
		}

		asteroid.px = offsetx;
		asteroid.py = offsety;

		var target_point = border_point(game, { px: Math.random() * game.canvas.width, py: Math.random() * game.canvas.height }, asteroid.width / 2);
		var angle = point_angle(offsetx, offsety, target_point.px, target_point.py);
		path.angle = angle;

		game.entities.push(asteroid);
		var entrance_position = asteroid_entrance(game, asteroid);
		if (entrance_position) {
			entrance_position = border_point(game, entrance_position, 16);
			game.game_systems.ui_container.sub_entities.push(new UIWarningSign(game, entrance_position.px, entrance_position.py));
		}
	}
};



function asteroid_entrance(game, asteroid) {
	var points = [
		{ px: 0, py: 0 },
		{ px: game.canvas.width, py: 0 },
		{ px: game.canvas.width, py: game.canvas.height },
		{ px: 0, py: game.canvas.height },
	];

	var offset = point_offset(asteroid.path[0].angle, 1000);
	var asteroid_path = [ asteroid, { px: asteroid.px + offset.px, py: asteroid.py + offset.py } ];

	var intersection;
	var entrances = [];

	intersection = segment_intersection(asteroid_path[0], asteroid_path[1], points[0], points[1]);
	if (intersection)
		entrances.push(intersection);
	intersection = segment_intersection(asteroid_path[0], asteroid_path[1], points[1], points[2]);
	if (intersection)
		entrances.push(intersection);
	intersection = segment_intersection(asteroid_path[0], asteroid_path[1], points[2], points[3]);
	if (intersection)
		entrances.push(intersection);
	intersection = segment_intersection(asteroid_path[0], asteroid_path[1], points[3], points[0]);
	if (intersection)
		entrances.push(intersection);

	entrances.sort(function (a, b) {
		return points_dist(asteroid, a) - points_dist(asteroid, b);
	});
	// console.log('entrances:', entrances);

	return entrances[0];
}

// tag for player entity to equip explosive missiles
function EquipedExplosiveMissilesTag() {
	this.timer = 60 * 30; // 30 seconds of explosive missiles
}

// tag for player entity to disable controls during emp
function EMPStatusEffectTag() {
	this.timer = 60 * 1.5; // 1.5 seconds of emp
}

// tag for director entity to enable darkness
function EnableDarknessTag() {}

// tag indicates that entity is source of point light
function PointLightSourceTag() {}
// tag indicates that entity is source of directed light
function DirectedLightSourceTag() {}

function DarknessSystem(game) {
	Entity.call(this, game);
	this.offset = 0;
	this.texture = game.images.darkness_texture;
	this.texture_size = 64;

	this.darkness_level = 0;
}
DarknessSystem.prototype = Object.create(Entity.prototype);
DarknessSystem.prototype.update = function(game) {
	Entity.prototype.update.call(this, game);
	this.offset = (this.offset + 0.25) % 64;
	this.point_light_sources = game.query_entities_by_tag(Entity, PointLightSourceTag);
	this.directed_light_sources = game.query_entities_by_tag(Entity, DirectedLightSourceTag);
	// console.log("debug point_light_sources:", this.point_light_sources);
	// this.player_ship = game.query_entities(PlayerShip)[0];

	if (game.game_systems.npc_director.get_tag(EnableDarknessTag)) {
		if (this.darkness_level < 1) {
			this.darkness_level += 0.002;
		}
	} else {
		if (this.darkness_level > 0) {
			this.darkness_level -= 0.002;
		}
	}
};
DarknessSystem.prototype.draw = function(ctx) {
	Entity.prototype.draw.call(this, ctx);
	if (this.visible && this.darkness_level > 0.1) {
		ctx.save();

		ctx.globalAlpha = Math.floor(this.darkness_level / 0.1) * 0.1;

		var buffer = this.render(ctx.canvas.width, ctx.canvas.height);
		this.render_light(buffer, this.point_light_sources, this.directed_light_sources);
		ctx.drawImage(buffer, 0, 0, ctx.canvas.width, ctx.canvas.height);

		ctx.restore();
	}
};
DarknessSystem.prototype.texture_darkness = function(ctx) {
	// ctx.fillStyle = '#111';
	// ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);

	for (var y = -1; y < ctx.canvas.height / this.texture_size; y++) {
		for (var x = -1; x < ctx.canvas.width / this.texture_size; x++) {
			ctx.drawImage(this.texture, this.offset + x * this.texture_size, this.offset + y * this.texture_size, this.texture_size, this.texture_size);
		}
	}
};
DarknessSystem.prototype.render = function(width, height) {
	var buffer_canvas = document.createElement('canvas');
	buffer_canvas.width = width;
	buffer_canvas.height = height;
	var buffer_context = buffer_canvas.getContext('2d');
	buffer_context.imageSmoothingEnabled = false;

	this.texture_darkness(buffer_context);

	return buffer_canvas;
};
DarknessSystem.prototype.render_light = function(buffer_canvas, point_light_sources, directed_light_sources) {
	var buffer_context = buffer_canvas.getContext('2d');

	buffer_context.globalCompositeOperation = "destination-out";
	buffer_context.fill_style = '#fff';

	for (var x = -1; x <= 1; x++) {
		var offsetx = x * buffer_canvas.width;
		for (var y = -1; y <= 1; y++) {
			var offsety = y * buffer_canvas.height;

			for (var i = 0; i < directed_light_sources.length; i++) {
				var source = directed_light_sources[i];

				var offset_left = point_offset(source.angle - 30, 275);
				var offset_right = point_offset(source.angle + 30, 275);

				buffer_context.globalAlpha = 0.7;
				buffer_context.beginPath();
				buffer_context.moveTo(offsetx + source.px, offsety + source.py);
				buffer_context.lineTo(offsetx + source.px + offset_left.px, offsety + source.py + offset_left.py);
				buffer_context.lineTo(offsetx + source.px + offset_right.px, offsety + source.py + offset_right.py);
				buffer_context.lineTo(offsetx + source.px, offsety + source.py);
				buffer_context.fill();
			}

			for (var i = 0; i < point_light_sources.length; i++) {
				var source = point_light_sources[i];
				buffer_context.beginPath();
				buffer_context.globalAlpha = 0.7;
				buffer_context.ellipse(offsetx + source.px, offsety + source.py, 100, 100, 45 * Math.PI/180, 0, 2 * Math.PI);
				buffer_context.fill();
			}
		}
	}

	for (var x = -1; x <= 1; x++) {
		var offsetx = x * buffer_canvas.width;
		for (var y = -1; y <= 1; y++) {
			var offsety = y * buffer_canvas.height;

			for (var i = 0; i < directed_light_sources.length; i++) {
				var source = directed_light_sources[i];

				var offset_left = point_offset(source.angle - 20, 200);
				var offset_right = point_offset(source.angle + 20, 200);

				buffer_context.globalAlpha = 1;
				buffer_context.beginPath();
				buffer_context.moveTo(offsetx + source.px, offsety + source.py);
				buffer_context.lineTo(offsetx + source.px + offset_left.px, offsety + source.py + offset_left.py);
				buffer_context.lineTo(offsetx + source.px + offset_right.px, offsety + source.py + offset_right.py);
				buffer_context.lineTo(offsetx + source.px, offsety + source.py);
				buffer_context.fill();
			}

			for (var i = 0; i < point_light_sources.length; i++) {
				var source = point_light_sources[i];
				buffer_context.beginPath();
				buffer_context.globalAlpha = 1;
				buffer_context.ellipse(offsetx + source.px, offsety + source.py, 50, 50, 45 * Math.PI/180, 0, 2 * Math.PI);
				buffer_context.fill();
			}
		}
	}
};


function UIContainer(game) {
	Entity.call(this, game);
	this.z_index = 1000;
}
UIContainer.prototype = Object.create(Entity.prototype);




function main () {
	var canvas = document.querySelector('#game_canvas');
	var ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;



	var images = {
		fighter: "fighter.png",
		missile: "missile.png",
		explosive_missile: "explosive_missile.png",
		ufo: "ufo.png",
		asteroid_64: "asteroid_64.png",
		explosive_charge: "explosive_charge.png",
		explosion: "explosion.png",
		emp_explosion: "emp_explosion.png",
		steel_asteroid_base: "steel_asteroid_base.png",
		steel_asteroid_plates: "steel_asteroid_plates.png",
		explosive_mine: "explosive_mine.png",
		emp_mine: "emp_mine.png",
		super_mine: "super_mine.png",
		red_crystal: "red_crystal.png",
		icicle: "icicle.png",
		icicle_cluster: "icicle_cluster.png",
		icicle_core: "icicle_core.png",

		darkness_texture: "darkness_texture.png",
		particle_effect_generic: "particle_effect_generic.png",
		p9_green_ui: "p9_green_ui.png",
		warning_sign: "warning_sign.png",
		ui_missile: "ui_missile.png",
		ui_explosive_missile: "ui_explosive_missile.png",
	};

	load_all_images(images, function () {
		console.log("all images loaded");


		var game = new GameSystem(canvas, { images: images });

		game.game_systems.darkness_system = new DarknessSystem(game);
		game.game_systems.ui_container = new UIContainer(game);

		game.game_systems.debug_system = new DebugSystem(game);
		game.game_systems.debug_system.visible = false;
		game.game_systems.debug_system.add_debug_text({
			update: function (game) {
				this.text = "# entities: " + game.entities.length;
			},
		});
		game.game_systems.debug_system.add_debug_text({
			text: "asteroids:",
			update: function (game) {
				this.rays = [];
				var asteroids = game.query_entities(Asteroid);
				for (var i = 0; i < asteroids.length; i++) {
					this.rays.push(asteroids[i]);
				}
			},
		});

		game.game_systems.npc_director = new NPCDirectorEntity(game, [
			// { spawn_interval: 60, max_spawned: 5, max_spawned_to_end: 2, wave_spawn_count: 4, batches: [
			// 	{ spawn_count: 1, enemy_type: MediumAsteroid, min_speed: 0.5, },
			// ] },
			{ spawn_interval: 120, max_spawned: 2, wave_spawn_count: 3, batches: [
				{ spawn_count: 2, enemy_type: IcicleCarrier, min_speed: 0.7, },
				// { spawn_count: 1, enemy_type: ExplosiveMine, min_speed: 1, },
			] },
			{ spawn_interval: 60, max_spawned: 1, wave_spawn_count: 3, batches: [
				{ direction: 0, spawn_count: 4, enemy_type: DodgingUFO, min_speed: 2, max_speed: 2, },
			] },
			{ spawn_interval: 60, max_spawned: 8, max_spawned_to_end: 4, wave_spawn_count: 3, batches: [
				{ direction: 2, spawn_count: 2, enemy_type: MediumAsteroid, min_speed: 1, },
				{ direction: 2, spawn_count: 1, enemy_type: MediumSteelAsteroid, min_speed: 1, },
			] },
			// { spawn_interval: 60, wave_spawn_count: 1, max_spawned_to_end: 2, wave_tags: [ new EnableDarknessTag() ], batches: [
			// 	{ spawn_count: 1, enemy_type: LargeAsteroid, max_speed: 2, },
			// ] },
			{ spawn_interval: 120, max_spawned: 6, max_spawned_to_end: 6, wave_spawn_count: 2, wave_tags: [ new EnableDarknessTag() ], batches: [
				{ direction: 0, spawn_count: 4, enemy_type: SmallAsteroid, },
				{ direction: 1, spawn_count: 4, enemy_type: SmallAsteroid, },
				{ direction: 2, spawn_count: 4, enemy_type: SmallAsteroid, },
				{ direction: 3, spawn_count: 4, enemy_type: SmallAsteroid, },
				{ spawn_count: 1, enemy_type: MediumExplosivesAsteroid, min_speed: 1, },
			] },
			{ spawn_interval: 60, max_spawned: 4, wave_spawn_count: 2, batches: [
				{ spawn_count: 1, enemy_type: LargeAsteroid, min_speed: 1, },
				{ spawn_count: 4, enemy_type: MediumExplosivesAsteroid, min_speed: 1, },
				{ spawn_count: 2, enemy_type: EMPMine, min_speed: 0.25, },
			] },
			{ spawn_interval: 120, max_spawned: 4, wave_spawn_count: 2, batches: [
				{ spawn_count: 6, enemy_type: MediumSteelAsteroid, min_speed: 1, },
				{ spawn_count: 4, enemy_type: ExplosiveMine, min_speed: 0.5, },
			] },
			{ spawn_interval: 120, max_spawned: 3, wave_spawn_count: 3, batches: [
				{ spawn_count: 1, enemy_type: GiantSteelAsteroid, min_speed: 0.25, },
			] },
			{ spawn_interval: 120, max_spawned: 1, wave_spawn_count: 1, max_spawned_to_end: 1, batches: [
				{ spawn_count: 1, enemy_type: GiantSteelAsteroid, min_speed: 0.25, },
			] },
			{ spawn_interval: 60, max_spawned: 5, wave_spawn_count: 8, batches: [
				{ spawn_count: 2, enemy_type: ExplosiveMine, min_speed: 1, },
			] },
			{ spawn_interval: 60, max_spawned: 8, wave_spawn_count: 1, batches: [
				{ spawn_count: 1, enemy_type: SuperMine, min_speed: 1, },
			] },
			{ spawn_interval: 120, max_spawned: 2, wave_spawn_count: 3, batches: [
				{ spawn_count: 2, enemy_type: IcicleCarrier, min_speed: 0.7, },
				{ spawn_count: 1, enemy_type: ExplosiveMine, min_speed: 1, },
			] },
			// { spawn_interval: 120, max_spawned: 4, wave_spawn_count: 4, wave_tags: [ new EnableDarknessTag() ], batches: [
			// 	{ spawn_count: 2, enemy_type: MediumSteelAsteroid, min_speed: 1.5, },
			// 	{ spawn_count: 2, enemy_type: MediumAsteroid, min_speed: 1, },
			// 	{ spawn_count: 2, enemy_type: ExplosiveMine, min_speed: 0.25, },
			// ] },
		]);

		// game.particle_systems.gas_particles = new ParticleEffectSystem(game, { fill_style: '#202', particle_image: game.images.particle_steam, });

		// game.entities.push(game.creep_system);
		// game.entities.push(game.building_system);
		// // game.entities.push(new XHive(game, 16 * 5 + 48 / 2, 16 * 5 + 48 / 2));
		var player_ship = new PlayerShip(game, 300, 300);
		game.entities.push(player_ship);
		game.game_systems.ui_container.sub_entities.push(new UIMissileDisplay(game, 8 * 12 / 2 + 16, 480 - 4 * 8 / 2 - 16, player_ship));


		// var asteroid = new SmallAsteroid(game, 800, 200,
		// 	[ { angle: 180, speed: 0.75 + Math.random() * 0.25, }, ]);
		// game.entities.push(asteroid);
		// var entrance_position = asteroid_entrance(game, asteroid);
		// if (entrance_position) {
		// 	entrance_position = border_point(game, entrance_position, 16);
		// 	game.entities.push(new UIWarningSign(game, entrance_position.px, entrance_position.py));
		// }
		// game.entities.push(new DebugEntity(game, player_ship));

		// for (var i = 0; i < 5; i++) {
		// 	var startx = -20;
		// 	var starty = -20;
		// 	var targetx = 32 + Math.random() * (640 - 32 * 2);
		// 	var targety = 32 + Math.random() * (480 - 32 * 2);
		// 	var angle = point_angle(startx, starty, targetx, targety);

		// 	game.entities.push(new LargeAsteroid(game, startx, starty,
		// 		[ { angle: angle, speed: 0.25 + Math.random() * 0.25, }, ]));
		// }
		// for (var i = 0; i < 10; i++) {
		// 	var startx = -20;
		// 	var starty = -20;
		// 	var targetx = 32 + Math.random() * (640 - 32 * 2);
		// 	var targety = 32 + Math.random() * (480 - 32 * 2);
		// 	var angle = point_angle(startx, starty, targetx, targety);

		// 	game.entities.push(new SmallAsteroid(game, startx, starty,
		// 		[ { angle: angle, speed: 0.25 + Math.random() * 0.5, }, ]));
		// }
		// game.entities.push(new UIP9Box(game, 8 * 12 / 2 + 16, 480 - 4 * 8 / 2 - 16, 12, 8, 8, 4, game.images.p9_green_ui));

		game.particle_systems.fire_particles = new ParticleEffectSystem(game, {
			particle_image: game.images.particle_effect_generic,
			fill_style: '#fd8',
			particle_size: 8,
			particle_longevity: 0.2,
			particle_deflate: 1.5,
		});
		game.particle_systems.steel_plate_particles = new ParticleEffectSystem(game, {
			// particle_image: game.images.particle_effect_generic,
			particle_image: game.images.steel_asteroid_plates,
			static_images: true,
			particle_size: 24,
			particle_longevity: 0.05,
		});


		setInterval(game.step_game_frame.bind(game, ctx), 1000 / 60);
	});
}

window.addEventListener('load', main);
