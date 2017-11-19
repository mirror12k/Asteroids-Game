

function wrapped_position (game, pxy) {
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

function WrappingPathEntity(game, px, py, width, height, image, path) {
	PathEntity.call(this, game, px, py, width, height, image, path);
}
WrappingPathEntity.prototype = Object.create(PathEntity.prototype);
WrappingPathEntity.prototype.constructor = WrappingPathEntity;
WrappingPathEntity.prototype.update = function(game) {
	PathEntity.prototype.update.call(this, game);

	var wrapped = wrapped_position(game, this);
	this.px = wrapped.px;
	this.py = wrapped.py;
};
WrappingPathEntity.prototype.draw = function(ctx) {
	PathEntity.prototype.draw.call(this, ctx);

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
};
WrappingCollidingEntity.prototype.check_collision = function(game) {
	for (var i = 0; i < this.collision_map.length; i++) {
		// console.log("debug: ", this.collision_radius + this.collision_map[i].class.prototype.collision_radius);
		// var colliding = game.find_near(this, this.collision_map[i].class, this.collision_radius + this.collision_map[i].class.prototype.collision_radius);
		var colliding = game.find_near_dynamic(this, this.collision_map[i].class, this.collision_radius);
		for (var k = 0; k < colliding.length; k++) {
			this[this.collision_map[i].callback](game, colliding[k]);
		}
	}
};


function Asteroid(game, px, py, path) {
	WrappingPathEntity.call(this, game, px, py, 64, 64, game.images.asteroid_64, path);
	this.health = 100;
	this.angle = Math.random() * 360;
	this.rotation = Math.random() * 2 - 1;
	// this.collision_radius = size * 30;
}
Asteroid.prototype = Object.create(WrappingPathEntity.prototype);
Asteroid.prototype.collision_radius = 30;


function PlayerShip(game, px, py, path) {
	WrappingCollidingEntity.call(this, game, px, py, 48, 48, game.images.fighter, path);
	this.sx = 0;
	this.sy = 0;
	this.angle_granularity = 5;
	this.fire_timer = 0;
}
PlayerShip.prototype = Object.create(WrappingCollidingEntity.prototype);
PlayerShip.prototype.collision_radius = 8;
PlayerShip.prototype.collision_map = [
	{
		class: Asteroid,
		callback: 'hit_asteroid',
	},
];
PlayerShip.prototype.update = function(game) {
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
		var offset = point_offset(this.angle, 0.15);
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

	if (point_dist(this.sx, this.sy) > 5) {
		var speed = point_normal(this.sx, this.sy);
		this.sx = speed.px * 5;
		this.sy = speed.py * 5;
	}

	this.px += this.sx;
	this.py += this.sy;

	if (this.fire_timer) {
		this.fire_timer--;
	} else {
		if (game.keystate[' ']) {
			this.fire(game);
			this.fire_timer = 30;
		}
	}

	WrappingCollidingEntity.prototype.update.call(this, game);
};
// Asteroid.prototype.collision_radius = 32;
PlayerShip.prototype.fire = function(game) {
	var offset = point_offset(this.angle, this.width / 2);
	var speed = point_offset(this.angle, 3);

	game.entities_to_add.push(new PlayerMissile(game, offset.px + this.px, offset.py + this.py,
			[{
				timeout: 360,
				sx: speed.px + this.sx,
				sy: speed.py + this.sy,
				angle: this.angle,
				// speed: 3,
				trail: { type: 'fire_particles', thickness: 0.5, speed: 1 },
			}],
	));
};
PlayerShip.prototype.hit_asteroid = function(game, other) {
	game.entities_to_remove.push(this);
};




function PlayerMissile(game, px, py, path) {
	WrappingCollidingEntity.call(this, game, px, py, 16, 16, game.images.missile, path);
	this.angle_granularity = 5;
}
PlayerMissile.prototype = Object.create(WrappingCollidingEntity.prototype);
PlayerMissile.prototype.collision_radius = 4;
PlayerMissile.prototype.collision_map = [
	{
		class: Asteroid,
		callback: 'hit_asteroid',
	},
];
PlayerMissile.prototype.hit_asteroid = function(game, other) {
	game.entities_to_remove.push(other);
	game.entities_to_remove.push(this);
	for (var i = 0; i < 25; i++) {
		// our position might be wildly offset, so we wrap our position to spawn particles properly
		var pos = wrapped_position(game, this);
		game.particle_systems.fire_particles.add_particle(pos.px, pos.py, 4);
	}
};




function main () {
	var canvas = document.querySelector('#game_canvas');
	var ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;



	var images = {
		fighter: "fighter.png",
		missile: "missile.png",
		ufo: "ufo.png",
		asteroid_64: "asteroid_64.png",

		particle_effect_generic: "particle_effect_generic.png",
	};

	load_all_images(images, function () {
		console.log("all images loaded");


		var game = new GameSystem(canvas, images);

		// game.creep_system = new CreepSystem(game, 640 / 16, 480 / 16);
		// game.building_system = new BuildingSystem(game, 640 / 16, 480 / 16);

		// game.particle_systems.gas_particles = new ParticleEffectSystem(game, { fill_style: '#202', particle_image: game.images.particle_steam, });

		// game.entities.push(game.creep_system);
		// game.entities.push(game.building_system);
		// // game.entities.push(new XHive(game, 16 * 5 + 48 / 2, 16 * 5 + 48 / 2));
		game.entities.push(new PlayerShip(game, 300, 300));
		game.entities.push(new Asteroid(game, 0, 460,
			[ { angle: Math.random() * 360, speed: 0.25 + Math.random() * 0.25, }, ]));
		game.entities.push(new Asteroid(game, 0, 460,
			[ { angle: Math.random() * 360, speed: 0.25 + Math.random() * 0.25, }, ]));
		game.entities.push(new Asteroid(game, 0, 460,
			[ { angle: Math.random() * 360, speed: 0.25 + Math.random() * 0.25, }, ]));
		// game.entities.push(new XFlyingSpore(game, 0, 0, 32, [
		// 	{ px: 280, py: 140, speed: 2, },
		// 	{ timeout: 0, call_system: [ {system: 'creep_system', method: 'spill_creep', args: [[Math.floor(280/16), Math.floor(140/16)], 3.5] } ] },
		// 	{ timeout: 0, call_system: [ {system: 'building_system', method: 'build_building',
		// 		args: [XSporePool, [Math.floor(280/16) - 1, Math.floor(140/16) - 1]] } ] },
		// ]));

		game.particle_systems.fire_particles = new ParticleEffectSystem(game, {
			particle_image: game.images.particle_effect_generic,
			fill_style: '#fd8',
			particle_size: 8,
			particle_longevity: 0.2,
		});


		setInterval(game.step_game_frame.bind(game, ctx), 1000 / 60);
	});
}

window.addEventListener('load', main);
