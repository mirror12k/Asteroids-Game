


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
		var colliding = game.find_near_dynamic(this, this.collision_map[i].class, this.collision_radius);
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
	this.hit(game, other);
	game.entities_to_remove.push(other);
	// spawn rocket explosion particles
	for (var i = 0; i < 25; i++) {
		game.particle_systems.fire_particles.add_particle(other.px, other.py, 4);
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

function ExplosiveCharge(game, px, py, path) {
	PathEntity.call(this, game, px, py, 8, 8, game.images.explosive_charge, path);
	this.primed = false;
	this.timer = 60;
	this.angle = Math.random() * 360;
}
ExplosiveCharge.prototype = Object.create(PathEntity.prototype);
ExplosiveCharge.prototype.update = function(game) {
	PathEntity.prototype.update.call(this, game);
	if (this.primed === true) {
		this.timer--;
		if (this.timer <= 0) {
			game.entities_to_remove.push(this);
		}
	}
};

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
};
Explosion.prototype.hit_player = function(game, other) {
	game.entities_to_remove.push(other);
	// spawn rocket explosion particles
	for (var i = 0; i < 25; i++) {
		game.particle_systems.fire_particles.add_particle(other.px, other.py, 4);
	}
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


function SmallAsteroid(game, px, py, path) {
	Asteroid.call(this, game, px, py, path);
	this.width = 32;
	this.height = 32;
}
SmallAsteroid.prototype = Object.create(Asteroid.prototype);
SmallAsteroid.prototype.collision_radius = 15;


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

	if (point_dist(this.sx, this.sy) > 5) {
		var speed = point_normal(this.sx, this.sy);
		this.sx = speed.px * 5;
		this.sy = speed.py * 5;
	}

	this.px += this.sx;
	this.py += this.sy;


	if (this.missile_count < this.missile_max) {
		if (this.reload_timer) {
			this.reload_timer--;
		} else {
			this.missile_count++;
			this.reload_timer = 60;
		}
	}

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

	game.entities_to_add.push(new PlayerMissile(game, offset.px + this.px, offset.py + this.py,
			[{
				timeout: 90,
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
	WrappingPathEntity.call(this, game, px, py, 16, 16, game.images.missile, path);
	this.angle_granularity = 5;
	this.disable_wrapping_first_time = false;
}
PlayerMissile.prototype = Object.create(WrappingPathEntity.prototype);
PlayerMissile.prototype.collision_radius = 4;
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

	for (var i = 0; i < bucket.missile_max; i++) {
		var missile = new ScreenEntity(game, i * 12 - 12 * bucket.missile_max / 2 + 6, 0, 16, 16, game.images.ui_missile);
		missile.angle = -60;
		this.sub_entities.push(missile);
	}
}
UIMissileDisplay.prototype = Object.create(UIP9Box.prototype);
UIMissileDisplay.prototype.update = function(game) {
	var missile_count = this.bucket.missile_count;
	var missile_max = this.bucket.missile_max;
	for (var i = 0; i < missile_max; i++) {
		this.sub_entities[i].visible = i < missile_count;
	}
};

function UIWarningSign(game, px, py) {
	ScreenEntity.call(this, game, px, py, 32, 32, game.images.warning_sign);
	this.blink = 60;
	this.blink_count = 5;
}
UIWarningSign.prototype = Object.create(ScreenEntity.prototype);
UIWarningSign.prototype.update = function(game) {
	Entity.prototype.update.call(this, game);
	this.blink--;
	if (this.blink < 0) {
		this.blink_count--;
		if (this.blink_count <= 0)
			game.entities_to_remove.push(this);
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
};
NPCDirectorEntity.prototype.spawn_batch = function(game, batch) {
	var direction = batch.direction;

	var min_speed = batch.min_speed || 0.5;
	var max_speed = batch.max_speed || 0.5;

	var enemy_type = batch.enemy_type || SmallAsteroid;
	var spawn_count = batch.spawn_count || 1;

	for (var i = 0; i < spawn_count; i++) {
		if (direction === undefined)
			direction = Math.floor(Math.random() * 4);
		var offsetx, offsety;
		if (direction === 0) {
			offsetx = game.canvas.width + 100;
			offsety = Math.random() * game.canvas.height;
		} else if (direction === 1) {
			offsetx = Math.random() * game.canvas.width;
			offsety = game.canvas.height + 100;
		} else if (direction === 2) {
			offsetx = -100;
			offsety = Math.random() * game.canvas.height;
		} else {
			offsetx = Math.random() * game.canvas.width;
			offsety = -100;
		}

		var target_point = border_point(game, { px: Math.random() * game.canvas.width, py: Math.random() * game.canvas.height }, 32);
		var angle = point_angle(offsetx, offsety, target_point.px, target_point.py);

		var asteroid = new enemy_type(game, offsetx, offsety,
			[ { angle: angle, speed: min_speed + Math.random() * (max_speed - min_speed), }, ]);
		game.entities.push(asteroid);
		var entrance_position = asteroid_entrance(game, asteroid);
		if (entrance_position) {
			entrance_position = border_point(game, entrance_position, 16);
			game.entities.push(new UIWarningSign(game, entrance_position.px, entrance_position.py));
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



function main () {
	var canvas = document.querySelector('#game_canvas');
	var ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;



	var images = {
		fighter: "fighter.png",
		missile: "missile.png",
		ufo: "ufo.png",
		asteroid_64: "asteroid_64.png",
		explosive_charge: "explosive_charge.png",
		explosion: "explosion.png",

		particle_effect_generic: "particle_effect_generic.png",
		p9_green_ui: "p9_green_ui.png",
		warning_sign: "warning_sign.png",
		ui_missile: "ui_missile.png",
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
		var player_ship = new PlayerShip(game, 300, 300);
		game.entities.push(player_ship);
		game.entities.push(new UIMissileDisplay(game, 8 * 12 / 2 + 16, 480 - 4 * 8 / 2 - 16, player_ship));
		game.entities.push(new NPCDirectorEntity(game, [
			// { spawn_interval: 60, max_spawned: 8, max_spawned_to_end: 4, wave_spawn_count: 4, batches: [
			// 	{ direction: 2, spawn_count: 2, enemy_type: MediumAsteroid, min_speed: 1, },
			// ] },
			// { spawn_interval: 60, wave_spawn_count: 1, batches: [
			// 	{ spawn_count: 1, enemy_type: LargeAsteroid, max_speed: 2, },
			// 	{ spawn_count: 1, enemy_type: MediumExplosivesAsteroid, max_speed: 0.5, },
			// ] },
			// { spawn_interval: 60, wave_spawn_count: 1, batches: [
			// 	{ spawn_count: 1, enemy_type: LargeAsteroid, max_speed: 2, },
			// ] },
			{ spawn_interval: 120, max_spawned: 6, max_spawned_to_end: 6, wave_spawn_count: 1, batches: [
				{ direction: 0, spawn_count: 4, enemy_type: SmallAsteroid, },
				{ direction: 1, spawn_count: 4, enemy_type: SmallAsteroid, },
				{ direction: 2, spawn_count: 4, enemy_type: SmallAsteroid, },
				{ direction: 3, spawn_count: 4, enemy_type: SmallAsteroid, },
			] },
			{ spawn_interval: 60, max_spawned: 4, max_spawned_to_end: 2, wave_spawn_count: 4, batches: [
				{ direction: 3, spawn_count: 2, enemy_type: MediumAsteroid, min_speed: 1, },
				{ direction: 3, spawn_count: 2, enemy_type: MediumExplosivesAsteroid, min_speed: 1, },
			] },
			{ spawn_interval: 60, max_spawned: 4, wave_spawn_count: 4, batches: [
				{ direction: 3, spawn_count: 1, enemy_type: LargeAsteroid, min_speed: 1, },
				{ direction: 3, spawn_count: 4, enemy_type: MediumExplosivesAsteroid, min_speed: 1, },
			] },
			// { spawn_interval: 1, max_spawned: 1, wave_spawn_count: 4, batches: [
			// 	{ spawn_count: 1, enemy_type: LargeAsteroid, min_speed: 0.1, max_speed: 0.1, }
			// ] },
		]));


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
		});


		setInterval(game.step_game_frame.bind(game, ctx), 1000 / 60);
	});
}

window.addEventListener('load', main);
