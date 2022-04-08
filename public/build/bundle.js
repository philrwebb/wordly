
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/box.svelte generated by Svelte v3.46.3 */

    const file$7 = "src/box.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let span;
    	let t_value = /*boxstate*/ ctx[0].content + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$7, 4, 1, 177);
    			attr_dev(div, "class", "box svelte-1mqn4s9");
    			set_style(div, "background-color", /*boxstate*/ ctx[0].color, false);

    			set_style(
    				div,
    				"border-color",
    				/*boxstate*/ ctx[0].content === ""
    				? 'lightgrey'
    				: 'black',
    				false
    			);

    			add_location(div, file$7, 3, 0, 45);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*boxstate*/ 1 && t_value !== (t_value = /*boxstate*/ ctx[0].content + "")) set_data_dev(t, t_value);

    			if (dirty & /*boxstate*/ 1) {
    				set_style(div, "background-color", /*boxstate*/ ctx[0].color, false);
    			}

    			if (dirty & /*boxstate*/ 1) {
    				set_style(
    					div,
    					"border-color",
    					/*boxstate*/ ctx[0].content === ""
    					? 'lightgrey'
    					: 'black',
    					false
    				);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Box', slots, []);
    	let { boxstate = {} } = $$props;
    	const writable_props = ['boxstate'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Box> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('boxstate' in $$props) $$invalidate(0, boxstate = $$props.boxstate);
    	};

    	$$self.$capture_state = () => ({ boxstate });

    	$$self.$inject_state = $$props => {
    		if ('boxstate' in $$props) $$invalidate(0, boxstate = $$props.boxstate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [boxstate];
    }

    class Box extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { boxstate: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Box",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get boxstate() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set boxstate(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/row.svelte generated by Svelte v3.46.3 */
    const file$6 = "src/row.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (7:1) {#each rowstate as boxstate}
    function create_each_block$3(ctx) {
    	let box;
    	let current;

    	box = new Box({
    			props: { boxstate: /*boxstate*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const box_changes = {};
    			if (dirty & /*rowstate*/ 1) box_changes.boxstate = /*boxstate*/ ctx[1];
    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(7:1) {#each rowstate as boxstate}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let current;
    	let each_value = /*rowstate*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "row svelte-o19ke8");
    			add_location(div, file$6, 5, 0, 80);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*rowstate*/ 1) {
    				each_value = /*rowstate*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Row', slots, []);
    	let { rowstate = [] } = $$props;
    	const writable_props = ['rowstate'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Row> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('rowstate' in $$props) $$invalidate(0, rowstate = $$props.rowstate);
    	};

    	$$self.$capture_state = () => ({ Box, rowstate });

    	$$self.$inject_state = $$props => {
    		if ('rowstate' in $$props) $$invalidate(0, rowstate = $$props.rowstate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [rowstate];
    }

    class Row extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { rowstate: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Row",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get rowstate() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rowstate(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/instructions.svelte generated by Svelte v3.46.3 */
    const file$5 = "src/instructions.svelte";

    function create_fragment$5(ctx) {
    	let div4;
    	let h1;
    	let t1;
    	let div0;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;
    	let t7;
    	let hr0;
    	let t8;
    	let h20;
    	let t10;
    	let div1;
    	let row0;
    	let t11;
    	let p3;
    	let t13;
    	let div2;
    	let row1;
    	let t14;
    	let p4;
    	let t16;
    	let div3;
    	let row2;
    	let t17;
    	let p5;
    	let t19;
    	let hr1;
    	let t20;
    	let h21;
    	let current;

    	row0 = new Row({
    			props: { rowstate: /*rowstate1*/ ctx[0] },
    			$$inline: true
    		});

    	row1 = new Row({
    			props: { rowstate: /*rowstate2*/ ctx[1] },
    			$$inline: true
    		});

    	row2 = new Row({
    			props: { rowstate: /*rowstate3*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			h1 = element("h1");
    			h1.textContent = "HOW TO PLAY";
    			t1 = space();
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Guess the WORDLE in six tries.";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Each guess must be a valid five-letter word. Hit the enter button to\n      submit.";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "After each guess, the color of the tiles will change to show how close\n      your guess was to the word.";
    			t7 = space();
    			hr0 = element("hr");
    			t8 = space();
    			h20 = element("h2");
    			h20.textContent = "Examples";
    			t10 = space();
    			div1 = element("div");
    			create_component(row0.$$.fragment);
    			t11 = space();
    			p3 = element("p");
    			p3.textContent = "The letter W is in the word and in the correct spot.";
    			t13 = space();
    			div2 = element("div");
    			create_component(row1.$$.fragment);
    			t14 = space();
    			p4 = element("p");
    			p4.textContent = "The letter I is in the word but in the wrong spot.";
    			t16 = space();
    			div3 = element("div");
    			create_component(row2.$$.fragment);
    			t17 = space();
    			p5 = element("p");
    			p5.textContent = "The letter U is not in the word in any spot.";
    			t19 = space();
    			hr1 = element("hr");
    			t20 = space();
    			h21 = element("h2");
    			h21.textContent = "A new WORDLE will be available each day!";
    			add_location(h1, file$5, 26, 2, 1272);
    			add_location(p0, file$5, 28, 4, 1321);
    			add_location(p1, file$5, 29, 4, 1363);
    			add_location(p2, file$5, 33, 4, 1469);
    			attr_dev(div0, "class", "content");
    			add_location(div0, file$5, 27, 2, 1295);
    			add_location(hr0, file$5, 38, 0, 1602);
    			add_location(h20, file$5, 39, 2, 1609);
    			add_location(p3, file$5, 42, 4, 1687);
    			attr_dev(div1, "class", "example svelte-1q9gj3f");
    			add_location(div1, file$5, 40, 2, 1629);
    			add_location(p4, file$5, 46, 4, 1818);
    			attr_dev(div2, "class", "example svelte-1q9gj3f");
    			add_location(div2, file$5, 44, 2, 1758);
    			add_location(p5, file$5, 50, 4, 1948);
    			attr_dev(div3, "class", "example svelte-1q9gj3f");
    			add_location(div3, file$5, 48, 2, 1888);
    			add_location(hr1, file$5, 52, 0, 2009);
    			add_location(h21, file$5, 53, 3, 2017);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$5, 25, 0, 1246);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h1);
    			append_dev(div4, t1);
    			append_dev(div4, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t3);
    			append_dev(div0, p1);
    			append_dev(div0, t5);
    			append_dev(div0, p2);
    			append_dev(div4, t7);
    			append_dev(div4, hr0);
    			append_dev(div4, t8);
    			append_dev(div4, h20);
    			append_dev(div4, t10);
    			append_dev(div4, div1);
    			mount_component(row0, div1, null);
    			append_dev(div1, t11);
    			append_dev(div1, p3);
    			append_dev(div4, t13);
    			append_dev(div4, div2);
    			mount_component(row1, div2, null);
    			append_dev(div2, t14);
    			append_dev(div2, p4);
    			append_dev(div4, t16);
    			append_dev(div4, div3);
    			mount_component(row2, div3, null);
    			append_dev(div3, t17);
    			append_dev(div3, p5);
    			append_dev(div4, t19);
    			append_dev(div4, hr1);
    			append_dev(div4, t20);
    			append_dev(div4, h21);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row0.$$.fragment, local);
    			transition_in(row1.$$.fragment, local);
    			transition_in(row2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row0.$$.fragment, local);
    			transition_out(row1.$$.fragment, local);
    			transition_out(row2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(row0);
    			destroy_component(row1);
    			destroy_component(row2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Instructions', slots, []);

    	let rowstate1 = [
    		{
    			content: 'W',
    			color: 'lightgreen',
    			inWord: true,
    			rightPlace: true
    		},
    		{
    			content: 'E',
    			color: 'white',
    			inWord: false,
    			rightPlace: false
    		},
    		{
    			content: 'A',
    			color: 'white',
    			inWord: false,
    			rightPlace: false
    		},
    		{
    			content: 'R',
    			color: 'white',
    			inWord: false,
    			rightPlace: false
    		},
    		{
    			content: 'Y',
    			color: 'white',
    			inWord: false,
    			rightPlace: false
    		}
    	];

    	let rowstate2 = [
    		{
    			content: 'P',
    			color: 'white',
    			inWord: true,
    			rightPlace: true
    		},
    		{
    			content: 'I',
    			color: '#fad6a5',
    			inWord: true,
    			rightPlace: false
    		},
    		{
    			content: 'L',
    			color: 'white',
    			inWord: false,
    			rightPlace: false
    		},
    		{
    			content: 'L',
    			color: 'white',
    			inWord: false,
    			rightPlace: false
    		},
    		{
    			content: 'S',
    			color: 'white',
    			inWord: false,
    			rightPlace: false
    		}
    	];

    	let rowstate3 = [
    		{
    			content: 'V',
    			color: 'white',
    			inWord: true,
    			rightPlace: true
    		},
    		{
    			content: 'A',
    			color: 'white',
    			inWord: false,
    			rightPlace: false
    		},
    		{
    			content: 'G',
    			color: 'white',
    			inWord: false,
    			rightPlace: false
    		},
    		{
    			content: 'U',
    			color: 'lightgrey',
    			inWord: false,
    			rightPlace: false
    		},
    		{
    			content: 'E',
    			color: 'white',
    			inWord: false,
    			rightPlace: false
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Instructions> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Row, rowstate1, rowstate2, rowstate3 });

    	$$self.$inject_state = $$props => {
    		if ('rowstate1' in $$props) $$invalidate(0, rowstate1 = $$props.rowstate1);
    		if ('rowstate2' in $$props) $$invalidate(1, rowstate2 = $$props.rowstate2);
    		if ('rowstate3' in $$props) $$invalidate(2, rowstate3 = $$props.rowstate3);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [rowstate1, rowstate2, rowstate3];
    }

    class Instructions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Instructions",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const getFromSupabase = async () => {
      const retStream = await fetch('/.netlify/functions/supabase');
      const retVal = await retStream.json();
      return retVal
    };
    const initialiseStore = async (keyboardData, gameData) => {
      for (let i = 0; i < keyboardData.keystate.length; i++) {
        for (let j = 0; j < keyboardData.keystate[i].length; j++) {
          keyboardData.keystate[i][j].inWord = false;
          keyboardData.keystate[i][j].picked = false;
          keyboardData.keystate[i][j].rightPlace = false;
          keyboardData.keystate[i][j].color = 'white';
        }
      }
      for (let i = 0; i < gameData.rowstate.length; i++) {
        for (let j = 0; j < gameData.rowstate[i].length; j++) {
          gameData.rowstate[i][j].inWord = false;
          gameData.rowstate[i][j].content = '';
          gameData.rowstate[i][j].rightPlace = false;
          gameData.rowstate[i][j].color = 'white';
        }
      }
      gameData.gameWon = false;
      gameData.currentRow = 0;
      gameData.currentCol = 0;
      gameData.wordToGuess = await getFromSupabase();
      return { keyboardData, gameData }
    };
    const keyboardData = writable({
      keystate: [
        [
          {
            keyLetter: 'Q',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'W',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'E',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'R',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'T',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'Y',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'U',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'I',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'O',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'P',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
        ],
        [
          {
            keyLetter: 'A',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'S',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'D',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'F',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'G',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'H',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'J',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'K',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'L',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
        ],
        [
          {
            keyLetter: 'ENTER',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'Z',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'X',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'C',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'V',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'B',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'N',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'M',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
          {
            keyLetter: 'DEL',
            inWord: false,
            picked: false,
            rightPlace: false,
            color: 'white',
          },
        ],
      ],
    });
    const gameData = writable({
      wordToGuess: [],
      gameWon: false,
      currentRow: 0,
      currentCol: 0,
      rowstate: [
        [
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
        ],
        [
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
        ],
        [
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
        ],
        [
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
        ],
        [
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
        ],
        [
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
          { content: '', color: 'white', inWord: false, rightPlace: false },
        ],
      ],
    });

    /* src/rows.svelte generated by Svelte v3.46.3 */
    const file$4 = "src/rows.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (7:1) {#each $gameData.rowstate as rowstate}
    function create_each_block$2(ctx) {
    	let row;
    	let current;

    	row = new Row({
    			props: { rowstate: /*rowstate*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};
    			if (dirty & /*$gameData*/ 1) row_changes.rowstate = /*rowstate*/ ctx[1];
    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(7:1) {#each $gameData.rowstate as rowstate}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let current;
    	let each_value = /*$gameData*/ ctx[0].rowstate;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "row svelte-p4zwh5");
    			add_location(div, file$4, 5, 0, 91);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$gameData*/ 1) {
    				each_value = /*$gameData*/ ctx[0].rowstate;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $gameData;
    	validate_store(gameData, 'gameData');
    	component_subscribe($$self, gameData, $$value => $$invalidate(0, $gameData = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Rows', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Rows> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Row, gameData, $gameData });
    	return [$gameData];
    }

    class Rows extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Rows",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/key.svelte generated by Svelte v3.46.3 */
    const file$3 = "src/key.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = `${/*keyLetter*/ ctx[2]}`;
    			attr_dev(div, "class", "key svelte-1ez4wip");
    			set_style(div, "background-color", /*letter*/ ctx[0].color, false);
    			add_location(div, file$3, 7, 0, 176);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*letter*/ 1) {
    				set_style(div, "background-color", /*letter*/ ctx[0].color, false);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Key', slots, []);
    	const dispatch = createEventDispatcher();
    	let { letter = {} } = $$props;
    	let keyLetter = letter.keyLetter;
    	const writable_props = ['letter'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Key> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("keypressed", { keyLetter });

    	$$self.$$set = $$props => {
    		if ('letter' in $$props) $$invalidate(0, letter = $$props.letter);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		letter,
    		keyLetter
    	});

    	$$self.$inject_state = $$props => {
    		if ('letter' in $$props) $$invalidate(0, letter = $$props.letter);
    		if ('keyLetter' in $$props) $$invalidate(2, keyLetter = $$props.keyLetter);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [letter, dispatch, keyLetter, click_handler];
    }

    class Key extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { letter: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Key",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get letter() {
    		throw new Error("<Key>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set letter(value) {
    		throw new Error("<Key>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/keyrow.svelte generated by Svelte v3.46.3 */
    const file$2 = "src/keyrow.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (7:2) {#each keysInRow as key}
    function create_each_block$1(ctx) {
    	let key;
    	let current;

    	key = new Key({
    			props: { letter: /*key*/ ctx[2] },
    			$$inline: true
    		});

    	key.$on("keypressed", /*keypressed_handler*/ ctx[1]);

    	const block = {
    		c: function create() {
    			create_component(key.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(key, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const key_changes = {};
    			if (dirty & /*keysInRow*/ 1) key_changes.letter = /*key*/ ctx[2];
    			key.$set(key_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(key, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(7:2) {#each keysInRow as key}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let span;
    	let current;
    	let each_value = /*keysInRow*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			span = element("span");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "class", "keyrow svelte-d1wl5z");
    			add_location(span, file$2, 5, 0, 83);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*keysInRow*/ 1) {
    				each_value = /*keysInRow*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(span, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Keyrow', slots, []);
    	let { keysInRow = [] } = $$props;
    	const writable_props = ['keysInRow'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Keyrow> was created with unknown prop '${key}'`);
    	});

    	function keypressed_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('keysInRow' in $$props) $$invalidate(0, keysInRow = $$props.keysInRow);
    	};

    	$$self.$capture_state = () => ({ Key, keysInRow });

    	$$self.$inject_state = $$props => {
    		if ('keysInRow' in $$props) $$invalidate(0, keysInRow = $$props.keysInRow);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [keysInRow, keypressed_handler];
    }

    class Keyrow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { keysInRow: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyrow",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get keysInRow() {
    		throw new Error("<Keyrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keysInRow(value) {
    		throw new Error("<Keyrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/keyboard.svelte generated by Svelte v3.46.3 */
    const file$1 = "src/keyboard.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (7:1) {#each $keyboardData.keystate as keysInRow}
    function create_each_block(ctx) {
    	let keyrow;
    	let current;

    	keyrow = new Keyrow({
    			props: { keysInRow: /*keysInRow*/ ctx[2] },
    			$$inline: true
    		});

    	keyrow.$on("keypressed", /*keypressed_handler*/ ctx[1]);

    	const block = {
    		c: function create() {
    			create_component(keyrow.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(keyrow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const keyrow_changes = {};
    			if (dirty & /*$keyboardData*/ 1) keyrow_changes.keysInRow = /*keysInRow*/ ctx[2];
    			keyrow.$set(keyrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(keyrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(keyrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(keyrow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(7:1) {#each $keyboardData.keystate as keysInRow}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let current;
    	let each_value = /*$keyboardData*/ ctx[0].keystate;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "keyboard svelte-1b1ccg1");
    			add_location(div, file$1, 5, 0, 103);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$keyboardData*/ 1) {
    				each_value = /*$keyboardData*/ ctx[0].keystate;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $keyboardData;
    	validate_store(keyboardData, 'keyboardData');
    	component_subscribe($$self, keyboardData, $$value => $$invalidate(0, $keyboardData = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Keyboard', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Keyboard> was created with unknown prop '${key}'`);
    	});

    	function keypressed_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$capture_state = () => ({ Keyrow, keyboardData, $keyboardData });
    	return [$keyboardData, keypressed_handler];
    }

    class Keyboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/App.svelte generated by Svelte v3.46.3 */

    const file = "src/App.svelte";

    // (133:4) {#if $gameData.gameWon || (!$gameData.gameWon && $gameData.currentRow > 5)}
    function create_if_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Reset Game";
    			add_location(button, file, 133, 6, 4262);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*resetGame*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(133:4) {#if $gameData.gameWon || (!$gameData.gameWon && $gameData.currentRow > 5)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let p;

    	let t2_value = (/*$gameData*/ ctx[0].gameWon
    	? `You won in ${/*$gameData*/ ctx[0].currentRow} attempts`
    	: /*message*/ ctx[1]) + "";

    	let t2;
    	let t3;
    	let t4;
    	let span;
    	let rows;
    	let span_intro;
    	let t5;
    	let keyboard;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = (/*$gameData*/ ctx[0].gameWon || !/*$gameData*/ ctx[0].gameWon && /*$gameData*/ ctx[0].currentRow > 5) && create_if_block(ctx);
    	rows = new Rows({ $$inline: true });
    	keyboard = new Keyboard({ $$inline: true });
    	keyboard.$on("keypressed", /*handlekeypressed*/ ctx[3]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "WEBB-WORD";
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			span = element("span");
    			create_component(rows.$$.fragment);
    			t5 = space();
    			create_component(keyboard.$$.fragment);
    			set_style(h1, "color", /*$gameData*/ ctx[0].gameWon ? "red" : "black", false);
    			add_location(h1, file, 127, 2, 4007);
    			attr_dev(p, "class", "svelte-19511fh");
    			add_location(p, file, 128, 2, 4078);
    			attr_dev(span, "class", "rows svelte-19511fh");
    			add_location(span, file, 137, 2, 4331);
    			attr_dev(div, "class", "container svelte-19511fh");
    			add_location(div, file, 126, 0, 3981);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			if (if_block) if_block.m(p, null);
    			append_dev(div, t4);
    			append_dev(div, span);
    			mount_component(rows, span, null);
    			append_dev(div, t5);
    			mount_component(keyboard, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handleKeydown*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$gameData*/ 1) {
    				set_style(h1, "color", /*$gameData*/ ctx[0].gameWon ? "red" : "black", false);
    			}

    			if ((!current || dirty & /*$gameData, message*/ 3) && t2_value !== (t2_value = (/*$gameData*/ ctx[0].gameWon
    			? `You won in ${/*$gameData*/ ctx[0].currentRow} attempts`
    			: /*message*/ ctx[1]) + "")) set_data_dev(t2, t2_value);

    			if (/*$gameData*/ ctx[0].gameWon || !/*$gameData*/ ctx[0].gameWon && /*$gameData*/ ctx[0].currentRow > 5) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(p, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rows.$$.fragment, local);

    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fly, { y: 200, duration: 2000 });
    					span_intro.start();
    				});
    			}

    			transition_in(keyboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rows.$$.fragment, local);
    			transition_out(keyboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			destroy_component(rows);
    			destroy_component(keyboard);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let message;
    	let $gameData;
    	let $keyboardData;
    	validate_store(gameData, 'gameData');
    	component_subscribe($$self, gameData, $$value => $$invalidate(0, $gameData = $$value));
    	validate_store(keyboardData, 'keyboardData');
    	component_subscribe($$self, keyboardData, $$value => $$invalidate(5, $keyboardData = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	onMount(async () => {
    		set_store_value(gameData, $gameData.wordToGuess = await getFromSupabase(), $gameData);
    	});

    	const handleKeydown = event => {
    		if (event.key === "F12") {
    			return;
    		}

    		event.preventDefault();
    		if ($gameData.currentRow > 5) return;

    		if (event.key === "Backspace" && $gameData.currentCol > 0) {
    			set_store_value(gameData, $gameData.currentCol--, $gameData);
    			set_store_value(gameData, $gameData.rowstate[$gameData.currentRow][$gameData.currentCol].content = "", $gameData);
    			return;
    		} else if (event.key === "Backspace") {
    			return;
    		} else if ($gameData.currentCol > 4 && event.key === "Enter") {
    			set_store_value(gameData, $gameData.currentRow++, $gameData);
    			set_store_value(gameData, $gameData.currentCol = 0, $gameData);
    			set_store_value(gameData, $gameData.gameWon = checkWord($gameData.rowstate[$gameData.currentRow - 1], $gameData.wordToGuess), $gameData);
    			set_store_value(keyboardData, $keyboardData.keystate = setKeyBoard($keyboardData.keystate, $gameData.rowstate[$gameData.currentRow - 1]), $keyboardData);
    			return;
    		} else if ($gameData.currentCol <= 4 && event.key === "Enter") {
    			return;
    		} else if ($gameData.currentCol <= 4 && event.key.length === 1 && (event.key >= "a" && event.key <= "z" || event.key >= "A" && event.key <= "Z")) {
    			set_store_value(gameData, $gameData.rowstate[$gameData.currentRow][$gameData.currentCol].content = event.key.toUpperCase(), $gameData);
    			set_store_value(gameData, $gameData.currentCol++, $gameData);
    			return;
    		} else if ($gameData.currentRow > 4) {
    			$$invalidate(1, message = "Bad Luck");
    			return;
    		}
    	};

    	const setKeyBoard = (keystate, rowstate) => {
    		for (let i = 0; i < rowstate.length; i++) {
    			for (let j = 0; j < keystate.length; j++) {
    				for (let k = 0; k < keystate[j].length; k++) {
    					if (keystate[j][k].keyLetter === rowstate[i].content) {
    						if (rowstate[i].inWord && rowstate[i].rightPlace) {
    							keystate[j][k].color = "lightgreen";
    							keystate[j][k].inWord = true;
    							keystate[j][k].rightplace = true;
    							break;
    						} else if (rowstate[i].inWord) {
    							keystate[j][k].color = "#fad6a5";
    							keystate[j][k].inWord = true;
    							break;
    						} else {
    							keystate[j][k].color = "lightgrey";
    							break;
    						}
    					}
    				}
    			}
    		}

    		return keystate;
    	};

    	const checkWord = (row, word) => {
    		for (let i = 0; i <= 4; i++) {
    			if (word[i] === row[i].content) {
    				row[i].inWord = true;
    				row[i].rightPlace = true;
    				row[i].color = "lightgreen";
    			}
    		}

    		for (let i = 0; i <= 4; i++) {
    			for (let j = 0; j <= 4; j++) {
    				if (!row[i].rightPlace && row[i].content === word[j]) {
    					row[i].inWord = true;
    					row[i].rightPlace = false;
    					row[i].color = "#fad6a5";
    				} else if (!row[i].rightPlace && !row[i].inWord) row[i].color = "lightgrey";
    			}
    		}

    		let countDone = 0;

    		for (let i = 0; i <= 4; i++) {
    			if (row[i].inWord === true && row[i].rightPlace === true) countDone++;
    		}

    		if (countDone == 5) return true; else return false;
    	};

    	const handlekeypressed = event => {
    		event.key = event.detail.keyLetter;
    		if (event.key === "ENTER") event.key = "Enter";
    		if (event.key === "DEL") event.key = "Backspace";
    		handleKeydown(event);
    	};

    	const resetGame = async () => {
    		const retVal = await initialiseStore($keyboardData, $gameData);
    		set_store_value(keyboardData, $keyboardData = retVal.keyboardData, $keyboardData);
    		set_store_value(gameData, $gameData = retVal.gameData, $gameData);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Instructions,
    		onMount,
    		Rows,
    		Keyboard,
    		fly,
    		gameData,
    		keyboardData,
    		initialiseStore,
    		getFromSupabase,
    		handleKeydown,
    		setKeyBoard,
    		checkWord,
    		handlekeypressed,
    		resetGame,
    		message,
    		$gameData,
    		$keyboardData
    	});

    	$$self.$inject_state = $$props => {
    		if ('message' in $$props) $$invalidate(1, message = $$props.message);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$gameData*/ 1) {
    			$$invalidate(1, message = $gameData.currentRow > 5 && !$gameData.gameWon
    			? `Bad Luck - the word was ${$gameData.wordToGuess.join("")}`
    			: "Guess the word");
    		}
    	};

    	return [$gameData, message, handleKeydown, handlekeypressed, resetGame];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
