import os
from flask import Flask, render_template, jsonify, request
from maze_logic import generate_solvable_maze, solve_maze, is_solvable, generate_solvable_maze_ffill

from minimax_logic import *
app = Flask(__name__)


# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# DATA_FILE = os.path.join(BASE_DIR, "data", "algorithms.json")

# with open(DATA_FILE, "r", encoding="utf-8") as f:
    # data = f.read()

maze_data = {}
path_data = []


@app.route('/')
def index():
    return render_template('indexlogo.html')

# Render HTML cho các trang khác (tổng quát)
@app.route('/<page>')
def render_page(page):
    print(page)
    try:
        return render_template(f"{page}")
    except:
        return "<h1>404 - Page not found</h1>", 404

@app.route('/Algorithm/<page>')
def render_algo_page(page):
    print(page)
    try:
        return render_template(f"Algorithm/{page}")
    except:
        return "<h1>404 - Page not found</h1>", 404


@app.route('/api/generate')
def generate():
    global maze_data, path_data
    rows = int(request.args.get('rows', 20))  # mặc định 20 nếu không truyền
    cols = int(request.args.get('cols', 20))
    algo = request.args.get('algo')  # lấy từ query string
    maze_data = generate_solvable_maze(rows, cols)
    print(algo)
    if not algo:
        maze_data, start, end = generate_solvable_maze_ffill(rows,cols)
    return jsonify({
        'maze': maze_data,
    })

@app.route('/api/solve', methods=['POST'])
def solve():
    algo = request.args.get('algo')  # lấy từ query string
    print(f"Thuật toán được sử dụng,{algo}")
    global maze_data, path_data
    data = request.json
    if not algo and ("algo" in data.keys()):
        algo = data["algo"]
    maze_data = data['maze']
    start = tuple(data['start'])
    end = tuple(data['end']) if data.get('end') else None
    
    res =  jsonify(solve_maze(maze_data, start, end, algo))
    return res


@app.route('/api/move', methods=['POST'])
def api_move():
    """
    Body JSON:
    {
      "board": [null, "X", null, "O", ...]  # length 9; use null for empty
      // optional:
      // "player": "X"  # player who just moved (not needed), or "bot" symbol
      // "bot": "O"     # override bot symbol
    }
    Response:
    {
      "move": 4,
      "tree": { ... }  # the    minimax tree starting from current board (player to move = 'O' if bot else deduced)
    }
    """
    data = request.get_json(force=True)
    board = data.get("board")
    if board is None or len(board) != 9:
        return jsonify({"error": "board must be provided as list of length 9"}), 400

    # Normalize javascript null -> python None if any
    board = [None if (x is None) else x for x in board]

    # Decide who moves next:
    x_count = sum(1 for v in board if v == 'X')
    o_count = sum(1 for v in board if v == 'O')
    # X starts first by convention. If counts equal => X to move; else O to move
    next_player = 'X' if x_count == o_count else 'O'

    # Let bot be 'O' by default, but allow override:
    bot_player = data.get("bot", "O")
    human_player = 'X' if bot_player == 'O' else 'O'

    # If next_player equals bot_player, the tree will compute best move for bot; if not, compute tree from human's turn
    score, best_move, tree = minimax_tree(board, next_player, bot_player, human_player)

    return jsonify({
        "move": best_move,
        "tree": tree
    })

if __name__ == "__main__":
    # app.run(debug=True)
    # Lấy port từ biến môi trường (nếu có) để chạy local dễ test
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
