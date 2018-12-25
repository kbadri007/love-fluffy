import { TweenMax, TimelineMax } from 'gsap/TweenMax';
import { Power3, Power0 } from 'gsap/EasePack';

import Draggable from 'gsap/Draggable';
import 'gsap/AttrPlugin';
import 'gsap/TextPlugin';

import { Util } from './base';

(() => {
	//////////////////////
	// SVG selectors
	//////////////////////
	const getEl = (selector) => (document.getElementById(selector));

	const loading = getEl('loading');
	const container = getEl('container');
	const restart = getEl('restart');

	const timer = getEl('timer');
	const progressBar = getEl('progress-bar');
	const timerText = getEl('timer-text');

	const title = getEl('title');
	const subtitle = getEl('subtitle');
	const instructions = getEl('instructions');
	const counter = getEl('counter');
	const counterText = getEl('counter-text');

	const heart = getEl('heart');
	const shadow = getEl('heart-shadow');

	const bubbleHappy = getEl('happy-bubble');
	const bubbleSad = getEl('sad-bubble');

	const cat = getEl('cat');
	const head = getEl('head');
	const torso = getEl('torso');
	const armR = getEl('arm-right');
	const armL = getEl('arm-left');
	const eyes = getEl('eyes');
	const eyeRP = getEl('eye-right-pupil');
	const eyeLP = getEl('eye-left-pupil');
	const tongue = getEl('tongue');
	const tail = getEl('tail');
	const tailCurl = getEl('tail-curl');
	const sadFace = getEl('sad-face');

	//////////////////////
	// Game
	//////////////////////
	const gameConfig = {
		requiredHearts: 10,
		timeLimit: 33,
		praises: ['Great!', 'Awesome!', 'Good job!', 'Keep it up!', 'Nice!', 'Excellent!'],

		get praise() {
			let rand = Math.floor(Math.random() * this.praises.length);
			return this.praises[rand];
		}
	};

	const introAnim = new TimelineMax({ delay: 1 });
	introAnim.set([title, subtitle, instructions, counter, heart], { autoAlpha: 0 })
		.set(counterText, { text: gameConfig.requiredHearts + ' left' })
		.to(loading, 0.5, { autoAlpha: 0 })
		.from(cat, 3, { y: 150, scale: 0.7, autoAlpha: 0 })
		.to(title, 1, { autoAlpha: 1 }, '-=2')
		.to(subtitle, 1, { autoAlpha: 1 })
		.to([instructions, heart, instructions, counter], 1, { autoAlpha: 1});

	const timerStart = new TimelineMax({  paused: true, onComplete: gameOver });
	timerStart.set(progressBar, { width: 0 })
		.from(timer, 2, { autoAlpha: 0 })
		.to(progressBar, gameConfig.timeLimit, {
			width: '100%',
			ease: Power0.easeNone,
			onUpdateParams:['{self}'],
			onUpdate: (tl) => {
				timerText.innerHTML = (tl.totalDuration() - tl.time()).toFixed(2);
			}
		}, 0)
		.to(timer, 0.5, { autoAlpha: 0 });

	const catHappy = new TimelineMax({
		paused: true,
		repeat: 1,
		ease: Power3.easeIn,
		onComplete: nextTurn
	});
	catHappy.set(eyes, { autoAlpha: 0 })
		.set(head, { transformOrigin: 'center bottom' })
		.to(head, 0.3, { rotation: 15 })
		.to(head, 0.3, { rotation: 0 })
		.to(head, 0.3, { rotation: -15 })
		.to(head, 0.3, { rotation: 0 })
		.set(eyes, { autoAlpha: 1 });

	let isGameOver = false;
	let remaining = gameConfig.requiredHearts;

	function nextTurn() {
		TweenMax.to(bubbleHappy, 0.25, { autoAlpha: 0, y: 20 });
		remaining--;

		TweenMax.set(instructions, { text: gameConfig.praise, autoAlpha: 1 });
		TweenMax.set(counterText, {text: remaining + ' left'});
		TweenMax.from([instructions, counter], 0.5, { scale: 1.5, ease: Power3.easeOut });
		TweenMax.to(instructions, 1, { delay: 2, autoAlpha: 0 });

		// move heart randomly
		const heartWidth = heart.getBBox().width;
		const containWidth = container.offsetWidth - heartWidth;
		const containHeight = container.offsetHeight - heartWidth;
		const randX = Math.random()*containWidth - containWidth/2;
		const randY = Math.random()*containHeight - containHeight/2;
		TweenMax.to(heart, 0.3, { x: randX, y: randY });

		if (remaining === gameConfig.requiredHearts-1) {
			TweenMax.to([title, subtitle], 0.5, { autoAlpha: 0 });
			timerStart.play();
		}

		// make heart reaapear
		if (timerStart.isActive()) heartPop.reverse();

		if (remaining <= 1) denyWin();
	}

	function denyWin() {
		isGameOver = true;

		heartEl.disable();
		heartEl.target.onmouseover = heartEl.target.onclick = function(e) {
			const cursorPos = { x: e.clientX, y: e.clientY };
			const targPos = Util.getCenter(this);
			const { x, y } = Util.getOffset(targPos, cursorPos);

			const randX = x + Math.random()*20 - 5;
			const randY = y + Math.random()*20 - 5;

			TweenMax.to(this, 0.2, { x: '+='+randX, y: '+='+randY });
		}
	}

	function gameOver() {
		heartPop.play(0);
		catHappy.stop().seek(0);

		TweenMax.set(title, { text: 'You made a kitten cry' });
		TweenMax.set(subtitle, {text: 'Fluffy is now heartbroken…' });
		TweenMax.to([title, subtitle], 1, { autoAlpha: 1 });
		TweenMax.to(subtitle, 1, { marginBottom: 0 });

		// Cat sad
		TweenMax.to(cat, 2, { transformOrigin: 'center bottom', scale: 1.25, x: '-25%', y: '50%' });
		TweenMax.to(bubbleSad, 1, { autoAlpha: 1 });
		TweenMax.from(bubbleSad, 1, { scale: 0.5 });
		TweenMax.set(sadFace, { autoAlpha: 1 });

		// restart
		TweenMax.from(restart, 2, { delay: 2, autoAlpha: 0, y: 20 });
		restart.onclick = () => {window.location.reload()};
	}

	//////////////////////
	// Draggable Heart
	//////////////////////

	const heartEl = Draggable.create(heart, { type:'x,y', bounds: '#container'})[0];

	heartEl.addEventListener('press', function() {
		heartPulse.pause();
		TweenMax.to(shadow, 0.3, { scale: 1, opacity: 0.5 });
	});

	heartEl.addEventListener('drag', function() {
		let x = Util.getCenter(this).x - Util.getCenter(eyes).x;
		let y = Util.getCenter(this).y - Util.getCenter(eyes).y;

		let dist = Math.sqrt(Math.abs(x*x + y*y));
		let rotate = Math.atan2(y, x);

		// Don't look if it's too far
		if (dist > 300) {
			TweenMax.to([eyeRP, eyeLP], 0.3, { rotation: 0, x: 0 });
			TweenMax.to(tongue, 0.3, {scaleY: 0});
			return;
		}

		// Make cat look at heart if close enough
		TweenMax.to([eyeRP, eyeLP], 0.3, {
			rotation: rotate + '_rad_short',
			transformOrigin: 'left center',
			x: Util.getRadius(eyeRP)
		});

		TweenMax.to(tongue, 0.3, {
			transformOrigin: 'center top',
			scaleY: 1
		});

		// if heart hit cat
		if (!isGameOver && (heartEl.hitTest(head, '50%') || heartEl.hitTest(torso, '50%'))) {
			heartPop.play(0);
			catHappy.play(0);

			TweenMax.to(bubbleHappy, 0.25, { autoAlpha: 1, y: -10 });
			TweenMax.to(bubbleHappy, 0.25, { delay: 0.25, y: 0 });

			heartEl.endDrag();
		}
	});

	heartEl.addEventListener('release', function() {
		TweenMax.to([eyeRP, eyeLP], 0.3, { rotation: 0, x: 0 });
		TweenMax.to(tongue, 0.3, {scaleY: 0});
		heartPulse.play(0);
	});

	// HEART PULSE
	const heartPulse = new TimelineMax();
	heartPulse.to(shadow, 2, {
		transformOrigin: 'center 45%',
		scale: 2,
		opacity: 0,
		repeat: -1,
		repeatDelay: 1,
		ease: Power3.easeOut
	});

	// HEART POP
	const heartPop = new TimelineMax({ paused: true });
	heartPop.to(heart, 0.2, { transformOrigin: 'center', scale: 1.5 })
		.to(heart, 0.3, { scale: 0, autoAlpha: 0 });

	// CAT IDLE
	TweenMax.set(tongue, { scaleY: 0 });
	const catPawing = new TimelineMax({ repeat: -1 });
	catPawing.to(armR, 0.5, { y: -5 })
		.to(armL, 0.5, { y: -5 })
		.to(armR, 0.5, { y: 0 }, 0.5)
		.to(armL, 0.5, { y: 0 }, 1);

	// TAIL CURL
	const catCurl = new TimelineMax({
		repeat: -1,
		yoyo: true,
		repeatDelay: 0.5,
		ease: Power3.easeInOut
	});
	catCurl.to(tailCurl, 0.5, { attr:{'stroke-dashoffset': 50} })
		.to(tail, 0.5, { x: 35 }, 0);

})();
