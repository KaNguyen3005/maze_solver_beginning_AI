import copy
def check_winner(board):
    lines = [
        (0,1,2),(3,4,5),(6,7,8), # rows
        (0,3,6),(1,4,7),(2,5,8), # cols
        (0,4,8),(2,4,6)          # diagonals
    ]
    for a,b,c in lines:
        if board[a] and board[a] == board[b] == board[c]:
            return board[a]  # 'X' or 'O'
    if all(board[i] is not None for i in range(9)):
        return 'DRAW'
    return None

# Build tree node structure
def make_node(state, move, player):
    return {
        "state": state,   # list of 9 elements
        "move": move,     # move that led to this state (index) or None for root
        "player": player, # player who made the move to reach this node ('X' or 'O')
        "score": None,    # will fill
        "children": []
    }

# Minimax that returns (score, best_move, tree_node)
def minimax_tree(board, current_player, bot_player='O', human_player='X'):
    winner = check_winner(board)
    if winner == bot_player:
        node = make_node(copy.deepcopy(board), None, None)
        node["score"] = 1
        return 1, None, node
    if winner == human_player:
        node = make_node(copy.deepcopy(board), None, None)
        node["score"] = -1
        return -1, None, node
    if winner == 'DRAW':
        node = make_node(copy.deepcopy(board), None, None)
        node["score"] = 0
        return 0, None, node

    # whose turn? current_player is the player to move now
    is_maximizing = (current_player == bot_player)
    best_score = -999 if is_maximizing else 999
    best_move = None
    root_node = make_node(copy.deepcopy(board), None, None)

    for i in range(9):
        if board[i] is None:
            new_board = copy.deepcopy(board)
            new_board[i] = current_player
            # recursively evaluate
            next_player = human_player if current_player == bot_player else bot_player
            score, _, child_node = minimax_tree(new_board, next_player, bot_player, human_player)
            # child_node represents subtree for move i; set its move/player
            child_node["move"] = i
            child_node["player"] = current_player
            root_node["children"].append(child_node)

            if is_maximizing:
                if score > best_score:
                    best_score = score
                    best_move = i
            else:
                if score < best_score:
                    best_score = score
                    best_move = i

    root_node["score"] = best_score
    return best_score, best_move, root_node