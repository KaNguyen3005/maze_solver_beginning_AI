import os
from flask import Flask, render_template, jsonify, request
from maze_logic import generate_solvable_maze, solve_maze

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
    maze_data, start, end = generate_solvable_maze(rows, cols)
    path_data = []
    return jsonify({
        'maze': maze_data,
        'start': start,
        'end': end
    })

@app.route('/api/solve', methods=['POST'])
def solve():
    algo = request.args.get('algo')  # lấy từ query string
    global maze_data, path_data
    data = request.json
    maze_data = data['maze']
    start = tuple(data['start'])
    end = tuple(data['end'])

    res =  jsonify(solve_maze(maze_data, start, end, algo))
    return res

if __name__ == "__main__":
    app.run(debug=True)
