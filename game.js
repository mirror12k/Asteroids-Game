



function WrappingPathEntity(game, px, py, width, height, image, path) {
	PathEntity.call(this, game, px, py, width, height, image, path);
}
WrappingPathEntity.prototype = Object.create(PathEntity.prototype);
WrappingPathEntity.prototype.update = function(game) {
	PathEntity.prototype.update.call(this, game);

	if (this.px < 0) {
		this.px += game.canvas.width;
	} else if (this.px >= game.canvas.width) {
		this.px -= game.canvas.width;
	}
	if (this.py < 0) {
		this.py += game.canvas.height;
	} else if (this.py >= game.canvas.height) {
		this.py -= game.canvas.height;
	}
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


function Asteroid(game, px, py, size, path) {
	WrappingPathEntity.call(this, game, px, py, Math.floor(size * 64), Math.floor(size * 64), game.images.asteroid_64, path);
	this.health = 100;
	this.size = Math.floor(size * 64);
	this.angle = Math.random() * 360;
	this.rotation = Math.random() * 2 - 1;
	this.collision_radius = size * 32;
}
Asteroid.prototype = Object.create(WrappingPathEntity.prototype);
// Asteroid.prototype.collision_radius = 32;


function PlayerShip(game, px, py, path) {
	WrappingPathEntity.call(this, game, px, py, 64, 64, game.images.fighter, path);
	this.sx = 0;
	this.sy = 0;
	this.angle_granularity = 5;
	this.fire_timer = 0;
}
PlayerShip.prototype = Object.create(WrappingPathEntity.prototype);
PlayerShip.prototype.update = function(game) {
	if (game.keystate.A) {
		this.angle -= 2;
		this.angle %= 360;
	} else if (game.keystate.D) {
		this.angle += 2;
		this.angle %= 360;
	}

	if (game.keystate.W) {
		var offset = point_offset(this.angle, 0.15);
		this.sx += offset.px;
		this.sy += offset.py;
	} else if (game.keystate.S) {
		var offset = point_offset(this.angle + 180, 0.05);
		this.sx += offset.px;
		this.sy += offset.py;
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

	if (game.keystate.W) {
		var offset = d2_point_offset(this.angle, -this.width / 2, -this.height / 8);
		game.particle_systems.fire_particles.add_particle(this.px + offset.px, this.py + offset.py, 1);
		offset = d2_point_offset(this.angle, -this.width / 2, this.height / 8);
		game.particle_systems.fire_particles.add_particle(this.px + offset.px, this.py + offset.py, 1);
	} else if (game.keystate.S) {
		var offset = d2_point_offset(this.angle, this.width / 4, -this.height / 8);
		game.particle_systems.fire_particles.add_particle(this.px + offset.px, this.py + offset.py, 1);
		offset = d2_point_offset(this.angle, this.width / 4, this.height / 8);
		game.particle_systems.fire_particles.add_particle(this.px + offset.px, this.py + offset.py, 1);
	} else if (game.keystate.A) {
		var offset = d2_point_offset(this.angle, -this.width / 4, this.height / 2);
		game.particle_systems.fire_particles.add_particle(this.px + offset.px, this.py + offset.py, 1);
	} else if (game.keystate.D) {
		var offset = d2_point_offset(this.angle, -this.width / 4, -this.height / 2);
		game.particle_systems.fire_particles.add_particle(this.px + offset.px, this.py + offset.py, 1);
	}

	WrappingPathEntity.prototype.update.call(this, game);
};
// Asteroid.prototype.collision_radius = 32;
PlayerShip.prototype.fire = function(game) {
	game.entities_to_add.push(new PlayerMissile(game, this.px, this.py,
			[{ timeout: 360, angle: this.angle, speed: 3, trail: { type: 'fire_particles', thickness: 0.5, speed: 1 }, }]
	));
};


function PlayerMissile(game, px, py, path) {
	WrappingPathEntity.call(this, game, px, py, 16, 16, game.images.missile, path);
	this.angle_granularity = 5;
}
PlayerMissile.prototype = Object.create(WrappingPathEntity.prototype);




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
		game.entities.push(new Asteroid(game, 0, 460, 4,
			[ { angle: Math.random() * 360, speed: 1 + Math.random() * 1, }, ]));
		game.entities.push(new Asteroid(game, 0, 460, 4,
			[ { angle: Math.random() * 360, speed: 1 + Math.random() * 1, }, ]));
		game.entities.push(new Asteroid(game, 0, 460, 4,
			[ { angle: Math.random() * 360, speed: 1 + Math.random() * 1, }, ]));
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
